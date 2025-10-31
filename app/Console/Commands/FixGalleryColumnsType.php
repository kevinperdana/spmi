<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\HomeSection;

class FixGalleryColumnsType extends Command
{
    protected $signature = 'fix:gallery-columns';
    protected $description = 'Fix galleryColumns type from string to number in home sections';

    public function handle()
    {
        $this->info('Fixing gallery columns type...');
        
        $sections = HomeSection::all();
        $fixed = 0;
        
        foreach ($sections as $section) {
            $content = $section->content;
            $modified = false;
            
            if (isset($content['rows'])) {
                foreach ($content['rows'] as &$row) {
                    if (isset($row['columns'])) {
                        foreach ($row['columns'] as &$column) {
                            // Fix direct elements
                            if (isset($column['elements'])) {
                                foreach ($column['elements'] as &$element) {
                                    if ($element['type'] === 'gallery') {
                                        if (isset($element['galleryColumns']) && is_string($element['galleryColumns'])) {
                                            $element['galleryColumns'] = (int) $element['galleryColumns'];
                                            $modified = true;
                                        }
                                    }
                                }
                            }
                            
                            // Fix nested columns
                            if (isset($column['columns'])) {
                                foreach ($column['columns'] as &$nestedColumn) {
                                    if (isset($nestedColumn['elements'])) {
                                        foreach ($nestedColumn['elements'] as &$element) {
                                            if ($element['type'] === 'gallery') {
                                                if (isset($element['galleryColumns']) && is_string($element['galleryColumns'])) {
                                                    $element['galleryColumns'] = (int) $element['galleryColumns'];
                                                    $modified = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if ($modified) {
                $section->content = $content;
                $section->save();
                $fixed++;
                $this->info("Fixed section ID: {$section->id}");
            }
        }
        
        $this->info("✅ Fixed {$fixed} section(s)");
        return 0;
    }
}
