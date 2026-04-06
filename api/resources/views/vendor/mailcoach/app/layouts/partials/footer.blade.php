<div class="mx-auto w-full max-w-layout py-16 flex flex-col gap-y-4 lg:flex-row lg:gap-x-16">
    <div class="lg:ml-auto flex font-medium flex-wrap items-center text-sm text-navy gap-x-9">
        @if(Auth::guard(config('mailcoach.guard'))->check())
            <span>
                <a class="inline-block hover:text-blue-dark" href="{{ route('export') }}">
                    {{ __mc('Export') }}
                </a>
                <span class="mx-1">/</span>
                <a class="inline-block hover:text-blue-dark" href="{{ route('import') }}">
                    {{ __mc('Import') }}
                </a>
            </span>
            <a class="inline-block hover:text-blue-dark" href="{{ route('debug') }}">
                {{ __mc('Resolve issues') }}
            </a>
        @endif

        <span class="text-navy/50">ThisWay Global</span>
    </div>
</div>
