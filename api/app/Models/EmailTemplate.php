<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Process;

class EmailTemplate extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'subject',
        'content',
        'mjml_content',
        'compiled_html',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    /**
     * Compile MJML content to HTML via the mjml CLI.
     * The compiled HTML contains Blade variables ({{ $field_1 }}, {{ $first_name }}, etc.)
     */
    public function compileMjml(): string
    {
        $result = Process::input($this->mjml_content)
            ->run('mjml -i -s');

        if ($result->failed()) {
            throw new \RuntimeException('MJML compilation failed: ' . $result->errorOutput());
        }

        $this->compiled_html = $result->output();
        $this->save();

        return $this->compiled_html;
    }

    /**
     * Get compiled HTML, compiling from MJML if needed.
     */
    public function getHtml(): string
    {
        if (! $this->compiled_html) {
            $this->compileMjml();
        }

        return $this->compiled_html;
    }

    /**
     * Build the variable map from the content array.
     * Content is stored as [{label: "...", value: "..."}, ...]
     * Maps to field_1, field_2, etc.
     */
    public function getContentVariables(): array
    {
        $variables = [];
        foreach ($this->content ?? [] as $i => $field) {
            $variables['field_' . ($i + 1)] = $field['value'] ?? '';
        }

        return $variables;
    }

    /**
     * Render the template using Blade with content variables + submission data.
     */
    public function render(array $submissionData = []): string
    {
        $html = $this->getHtml();

        // First, resolve any {{ $variable }} references inside content field values
        // (e.g. greeting field contains "Hi {{ $first_name }}," which needs the actual name)
        $contentVars = [];
        foreach ($this->content ?? [] as $i => $field) {
            $value = $field['value'] ?? '';
            // Replace {{ $var }} in content values with submission data
            foreach ($submissionData as $key => $val) {
                $value = str_replace('{{ $' . $key . ' }}', $val, $value);
            }
            $contentVars['field_' . ($i + 1)] = $value;
        }

        $variables = array_merge($contentVars, $submissionData);

        // Strip @ escaping from compiled MJML (MJML preserves @{{ }} literally)
        $html = str_replace('@{{', '{{', $html);

        // Replace any remaining {{ $var }} that aren't in our data with empty string
        // Content fields (field_*) use {!! !!} for raw HTML (allows <br> etc.)
        // Submission data fields use {{ }} for escaped output (security)
        $html = preg_replace_callback('/\{\{\s*\$(\w+)\s*\}\}/', function ($matches) use ($variables) {
            $var = $matches[1];
            if (! array_key_exists($var, $variables)) {
                return ''; // Remove undefined vars
            }
            // Content fields render as raw HTML, submission data gets escaped
            if (str_starts_with($var, 'field_')) {
                return '{!! $' . $var . ' !!}';
            }

            return '{{ $' . $var . ' }}';
        }, $html);

        return Blade::render($html, $variables);
    }
}
