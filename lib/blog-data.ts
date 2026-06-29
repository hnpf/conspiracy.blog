export interface BlogPost {
  id: string;
  title: string;
  snippet: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  link: string;
  highlighted?: boolean;
}

export const BlogPosts: BlogPost[] = [
  {
    id: 'post_1',
    title: 'first blog entry',
    snippet: 'test blog entry',
    content: `
    	this is the start of the blog. thanks virex <3
    `,
    date: 'Jun 28 2026',
    category: 'post cat',
    readTime: '1 min read',
    link: '/post_1',
    highlighted: false,
  },
  {
    id: 'post_2',
    title: 'unconventional communication methods - Part 1',
    snippet: 'unconventional communication methods',
    content: `
Lately, I've seen a lack of innovation for communication with unsigned drivers that are manually mapped. These are usually using .data ptr, hidden threads with shared memory, or IOCTL with IoCreateDriver.
I decided i could do better, and decided to figure out something relatively unique.

Disclaimer: this is not meant to be a copy/paste usage, as such some parts may be missing from the code shown.

# Part 1: The idea
I ended up with this abomination of a communication:
\`\`\`cpp
#include <windows.h>
#include <iostream>

namespace Memory
{
    DWORD gProcessPID = 0;

    template<typename T>
    T ReadVirtualMemory(uintptr_t Address, DWORD PID = 0)
    {
        if (!PID)
            PID = Memory::gProcessPID;

        return reinterpret_cast<T>(LoadLibraryW(L\"C:\\Windows\\System32\\ntoskrnl.exe\"));
    }

    template<typename T>
    bool WriteVirtualMemory(uintptr_t Address, T Buffer, DWORD PID = 0)
    {
        if (!PID)
            PID = Memory::gProcessPID;

        bool ret = LoadLibraryW(L\"C:\\Windows\\System32\\ntoskrnl.exe\") > 0;

        return true;
    }


    bool CheckDriverLoaded()
    {
        uintptr_t ImageBase = reinterpret_cast<uintptr_t>(NtCurrentPeb()->ImageBaseAddress);

        DWORD PeSig = ReadVirtualMemory<DWORD>(ImageBase);

        return PeSig == IMAGE_DOS_SIGNATURE;
    }
}


int main()
{
    if(!Memory::gProcessPID)
        Memory::gProcessPID = GetCurrentProcessId();

    if (!Memory::CheckDriverLoaded())
        printf(\"Driver not loaded!\\r\\n\");
    else
        printf(\"Driver loaded!\\r\\n\");
        
    uintptr_t ImageBase = reinterpret_cast<uintptr_t>(NtCurrentPeb()->ImageBaseAddress);

    DWORD PESig = Memory::ReadVirtualMemory<DWORD>(ImageBase);

    printf(\"pe signature: 0%X!\\r\\n\", PESig);

    printf(\"updating signature..\\r\\n\");

    if (!Memory::WriteVirtualMemory<DWORD>(ImageBase, 0x6767))
        printf(\"failed to write memory!\\r\\n\");

    PESig = Memory::ReadVirtualMemory<DWORD>(ImageBase);

    printf(\"pe signature: 0x%X!\\r\\n\", PESig);


    return 1;
}
\`\`\`

## this produces the following output:
\`\`\`
Driver loaded!
pe signature: 05A4D!
updating signature..
pe signature: 0x6767!
\`\`\`

# Okay, so how did you end up with communication with LoadLibraryW??

I love the features of the LoadImage callback, so i decided to start there. First I wanted to see relatively how many times I could trigger it a second, so I just decided to repeatedly load ntoskrnl.exe into the current process using LoadLibraryW, since the kernel will not load with the following error:
The C:\Windows\system32\ntoskrnl.exe application cannot be run in Win32 mode.
I assumed it would unload when called via LoadLibraryW. To test this i simply did this:

\`\`\`cpp
while(true)
{
  void* LoadedAt = (void*)LoadLibraryW(L\"C:\\Windows\\System32\\ntoskrnl.exe\");
  printf(\"ntoskrnl base: 0x%p!\\r\\n\", LoadedAt);

  if(LoadedAt)
    FreeLibrary((HINSTANCE)LoadedAt);

}
\`\`\`


Unsurprisingly, it always printed 0, however, loading it like this, shows it maps its sections..
\`\`\`cpp
while(true)
{
  void* LoadedAt = (void*)LoadLibraryExW(L\"C:\\Windows\\System32\\ntoskrnl.exe\", NULL, DONT_RESOLVE_DLL_REFERENCES);
  printf(\"ntoskrnl base: 0x%p!\\r\\n\", LoadedAt);

  if(LoadedAt)
    FreeLibrary((HINSTANCE)LoadedAt);
}
\`\`\`


This DID work successfully. This means the callback for LoadImage will be fired on it, and then get unloaded.
To not go too detailed on this part, this just unloads it similar to a dll returning false in its DLL_PROCESS_ATTACH call, meaning it gracefully unloads and returns that it failed to load.

As a result, caling it is quite fast and easily repeatable.

# Part 2: Getting it started..

i started out with a basic callback, meant to detect these specific loads. it ended up as:

\`\`\`cpp
#include <ntifs.h>
#include <ntddk.h>
#include <ntimage.h>

PVOID gKernelBase = 0;
ULONG gKernelPESize = 0;

/* kernel imports */
extern \"C\" POBJECT_TYPE* IoDriverObjectType;
extern \"C\" NTKERNELAPI NTSTATUS ObReferenceObjectByName(IN PUNICODE_STRING ObjectName, 
IN ULONG Attributes, IN PACCESS_STATE PassedAccessState, IN ACCESS_MASK DesiredAccess,
 IN POBJECT_TYPE ObjectType, IN KPROCESSOR_MODE AccessMode, IN OUT PVOID ParseContext, OUT PVOID* Object);

void LoadImageNotifyRoutine(PUNICODE_STRING ImageName, HANDLE PID, PIMAGE_INFO ImageInfo)
{
    /* (in)sanity check our arguements */
    if (!ImageName || !ImageName->Buffer || !PID || !ImageInfo)  return;

    if (ImageInfo->ImageSize != gKernelPESize) return;

    /* ntoskrnl loaded into the process.. we are attached to the process and thus can use IoGetCurrentProcess.. */

    DbgPrintEx(0, 0, \"ntoskrnl loaded into PID: %d!\\r\\n\", PID);
}


VOID DriverUnload(PDRIVER_OBJECT DriverObject)
{
    UNREFERENCED_PARAMETER(DriverObject);

    PsRemoveLoadImageNotifyRoutine(LoadImageNotifyRoutine);
}

NTSTATUS DriverEntry(PDRIVER_OBJECT DriverObject, PUNICODE_STRING RegistryPath)
{
    /* biblically accurate way of getting the kernel base LOL */
    UNICODE_STRING KernelModuleString = RTL_CONSTANT_STRING(L\"\\Driver\\WMIxWDM\"); /* WMIxWDM is a pseudo-driver created with IoCreateDriver and thus its DRIVER_OBJECT will be the kernels backing image. */
    PDRIVER_OBJECT KernelObject = 0;

    NTSTATUS Status = ObReferenceObjectByName(&KernelModuleString, OBJ_CASE_INSENSITIVE, 0, 0, *IoDriverObjectType, KernelMode, 0, reinterpret_cast<PVOID*>(&KernelObject));
    if (!NT_SUCCESS(Status) || !KernelObject) return Status;

    gKernelBase = KernelObject->DriverStart;

    DbgPrintEx(0, 0, \"Kernel Base: %p!\\r\\n\", gKernelBase);

    if (!gKernelBase) return STATUS_FAILED_DRIVER_ENTRY;

    IMAGE_DOS_HEADER* KernelDosHeader = reinterpret_cast<IMAGE_DOS_HEADER*>(gKernelBase);
    IMAGE_NT_HEADERS* KernelNTHeader = reinterpret_cast<IMAGE_NT_HEADERS*>((char*)KernelDosHeader + KernelDosHeader->e_lfanew);

    gKernelPESize = KernelNTHeader->OptionalHeader.SizeOfImage;

    ObDereferenceObject(KernelObject); /* safe practices guys! */

    /* support for not being legitimately loaded */

    if (DriverObject && RegistryPath)
    {
        DriverObject->DriverUnload = DriverUnload;
    }

    /* 
    setup the callback, obviously youd do something so this doesnt point to unsigned memory
    for simplicity this is not included however. 
    */
    
    NTSTATUS status = PsSetLoadImageNotifyRoutine(LoadImageNotifyRoutine);

    return status;
}
\`\`\`

As a result of loading this, each load, dbgview would show: 
# \"ntoskrnl loaded into PID: (pid)\"

# Part 3: The insanity and the result.
We still have to figure out a way to accept commands.. Right..?
Wrong. Absolutely wrong.
We are attached to the process, and thus we are able to read the processes virtual addresses/memory, read its stack, and interact with its threads.

The goal overall is to end up like:


User Mode

main()
  ↓
  ReadVirtualMemory(addr)
      ↓
      LoadLibraryW(ntoskrnl)
      ↓ 
      image callback

Kernel
LoadImageNotifyRoutine()
  walk user stack
  ↓
  find ReadVirtualMemory frame
  ↓
  recover arguments
  ↓
  perform read/write
  ↓
  patch RAX

For our module, the stack would look like:
\`\`\`
ntdll.dll!RtlHashUnicodeString+0x86
ntdll.dll!RtlpFindUnicodeStringInSection+0x88
ntdll.dll!RtlFindActivationContextSectionString+0xfc
ntdll.dll!sxsisol_SearchActCtxForDllName+0xb4
ntdll.dll!RtlDosApplyFileIsolationRedirection_Ustr+0x25f
ntdll.dll!LdrpApplyFileNameRedirection+0xff
ntdll.dll!LdrpPreprocessDllName+0x4c
ntdll.dll!LdrpLoadDll+0x71
ntdll.dll!LdrLoadDll+0xe4
KernelBase.dll!LoadLibraryExW+0x162
LoadImageUM.exe!Memory::ReadVirtualMemory<unsigned long>+0x2f
LoadImageUM.exe!main+0x71
LoadImageUM.exe!invoke_main+0x22 (Inline function)
LoadImageUM.exe!__scrt_common_main_seh+0x10c
kernel32.dll!BaseThreadInitThunk+0x14
ntdll.dll!RtlUserThreadStart+0x21
\`\`\`

All we have to do, is walk back the stack to KernelBase.dll!LoadLibraryExW, the function before that will be Memory::ReadVirtualMemory, it will be passed the  following arguments: then check that has 3 on its function call, to indicate a write, or whether it has 2 to indicate a read..
To explain it simply, we will be going back to the caveman times with assembly, all i have to do is check if the third process can be mapped to a PID with PsLookupProcessById, like this:

\`\`\`cpp
/* i made a wrapper around the usermode/kernel stack, mainly because its too large for this blog */
bool IsWriteOperation(StackHelper* InStackHelper)
{
    /* is a valid process */
    PEPROCESS Process;
    if (NT_SUCCESS(PsLookupProcessByProcessId((HANDLE)InStackHelper->a3, &Process)) && Process)
    {
        ObDereferenceObject(Process); /* safe practices boys! */
        return true;
    }

    /* not a valid process */
    return false;
}
\`\`\`

As a result we can infer whether or not it is a read/write operation using the third argument, since it will be empty/junk/stack/etc, if it is not a write operation. This is by far my preferred method for this. Though there is probably better.

You can end up with something like:
\`\`\`cpp
void HandleOperation()
{
    StackHelper* Stack = GetStack(); /* not shown here for simplicity, just pretty much gets all the arguements and returns this in a struct */
    bool bTreatAsWrite = IsWriteOperation(Stack);

    uintptr_t ReturnValue = 0;
    bool bWasSuccessful = false;

    if (bTreatAsWrite)
        bWasSuccessful = WriteVirtualMemory(Stack->Argument1 /* address */, Stack->Argument2 /* buffer */, Stack->Size);
    else
        bWasSuccessful = ReadVirtual(Stack->Argument1 /* address */, &ReturnValue, Stack->Size);

    Stack->UpdateRax(ReturnValue);
}
\`\`\`

And for usermode:



\`\`\`cpp
#include <windows.h>
#include <iostream>

namespace Memory
{
    DWORD gProcessPID = 0;

    template<typename T>
    T ReadVirtualMemory(uintptr_t Address, DWORD PID = 0)
    {
        if (!PID)
            PID = Memory::gProcessPID;

        return reinterpret_cast<T>(LoadLibraryW(L\"C:\\Windows\\System32\\ntoskrnl.exe\"));
    }

    template<typename T>
    bool WriteVirtualMemory(uintptr_t Address, T Buffer, DWORD PID = 0)
    {
        if (!PID)
            PID = Memory::gProcessPID;

        bool ret = LoadLibraryW(L\"C:\\Windows\\System32\\ntoskrnl.exe\") > 0;

        return true;
    }


    bool CheckDriverLoaded()
    {
        uintptr_t ImageBase = reinterpret_cast<uintptr_t>(NtCurrentPeb()->ImageBaseAddress);

        DWORD PeSig = ReadVirtualMemory<DWORD>(ImageBase);

        return PeSig == IMAGE_DOS_SIGNATURE;
    }
}


int main()
{
    if(!Memory::gProcessPID)
        Memory::gProcessPID = GetCurrentProcessId();

    if (!Memory::CheckDriverLoaded())
        printf(\"Driver not loaded!\\r\\n\");
    else
        printf(\"Driver loaded!\\r\\n\");
        
    uintptr_t ImageBase = reinterpret_cast<uintptr_t>(NtCurrentPeb()->ImageBaseAddress);

    DWORD PESig = Memory::ReadVirtualMemory<DWORD>(ImageBase);

    printf(\"pe signature: 0%X!\\r\\n\", PESig);

    printf(\"updating signature..\\r\\n\");

    if (!Memory::WriteVirtualMemory<DWORD>(ImageBase, 0x6767))
        printf(\"failed to write memory!\\r\\n\");

    PESig = Memory::ReadVirtualMemory<DWORD>(ImageBase);

    printf(\"pe signature: 0x%X!\\r\\n\", PESig);


    return 1;
}
\`\`\`

# Part 3.1: Expanding on the challenges involved.

The compiler will frequently break this, making the arguments not easily accessable (i fixed this by making my stack implementation), and will likely omit important items.
You need to disable all forms of inline expansion and processor/preprocessor/linker optimizations.
    `,
    date: 'Jun 28 2026',
    category: 'drivers',
    readTime: '15 min read',
    link: '/post_2',
    highlighted: true,
  }
];
