<x-filament-widgets::widget class="fi-account-widget">
    <x-filament::section>
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10 dark:bg-primary-400/10">
            <x-filament::icon icon="heroicon-o-envelope" class="h-5 w-5 text-primary-500 dark:text-primary-400" />
        </div>

        <div class="fi-account-widget-main">
            <h2 class="fi-account-widget-heading">
                Email Campaigns
            </h2>

            <p class="fi-account-widget-user-name">
                Manage lists, campaigns, and automations
            </p>
        </div>

        <x-filament::button
            color="gray"
            icon="heroicon-o-arrow-top-right-on-square"
            labeled-from="sm"
            tag="a"
            href="/email"
        >
            Email Dashboard
        </x-filament::button>
    </x-filament::section>
</x-filament-widgets::widget>
