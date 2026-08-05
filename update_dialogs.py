import os
import re

ICON_MAPPINGS = {
    "CreateDeckDialog.tsx": {"icon": "Plus", "title": "Create New Deck", "desc": "Enter a name and choose a color for your new deck."},
    "CreateFolderDialog.tsx": {"icon": "FolderPlus", "title": "Create New Folder", "desc": "Enter a name and choose a color for your new folder."},
    "ShareDeckDialog.tsx": {"icon": "Share2", "title": "Share Deck", "desc": "Make this deck public and share it with others."},
    "EditFolderDialog.tsx": {"icon": "Pencil", "title": "Edit Folder", "desc": "Update folder details."},
    "CardEditDialog.tsx": {"icon": "Pencil", "title": "Edit Card", "desc": "Update the front and back content of your flashcard."},
    "MoveItemDialog.tsx": {"icon": "MoveRight", "title": "Move Item", "desc": "Select a new location for this item."},
    "DeckExportDialog.tsx": {"icon": "Download", "title": "Export Deck", "desc": "Download your deck as a JSON or CSV file."},
    "DeckImportDialog.tsx": {"icon": "Upload", "title": "Import Deck", "desc": "Upload a JSON or CSV file to import a deck."},
    "AvatarEditorDialog.tsx": {"icon": "Image", "title": "Edit Avatar", "desc": "Upload and crop your profile picture."},
}

for root, _, files in os.walk("/home/artiekra/Personal/cardie/frontend/components"):
    for file in files:
        if file in ICON_MAPPINGS:
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            info = ICON_MAPPINGS[file]
            icon = info["icon"]
            
            # 1. Add import if missing
            if f"import {{ {icon} }}" not in content and f"{icon}," not in content and f"{icon} " not in content:
                # Find lucide-react import and add to it, or add new import
                lucide_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"]', content)
                if lucide_match:
                    imports = lucide_match.group(1)
                    if icon not in imports:
                        new_imports = f"{imports.strip()}, {icon}"
                        content = content.replace(lucide_match.group(0), f'import {{ {new_imports} }} from "lucide-react"')
                else:
                    # Insert after the last import
                    last_import_idx = content.rfind("import ")
                    end_of_line = content.find("\n", last_import_idx)
                    content = content[:end_of_line] + f'\nimport {{ {icon} }} from "lucide-react"' + content[end_of_line:]
            
            # 2. Replace DialogHeader
            # We want to match <DialogHeader>...</DialogHeader>
            # but preserve the title/desc if possible, or use defaults from mapping.
            
            # Find the DialogTitle and DialogDescription content
            title_match = re.search(r'<DialogTitle[^>]*>(.*?)</DialogTitle>', content, re.DOTALL)
            desc_match = re.search(r'<DialogDescription[^>]*>(.*?)</DialogDescription>', content, re.DOTALL)
            
            title = title_match.group(1).strip() if title_match else info["title"]
            desc = desc_match.group(1).strip() if desc_match else info["desc"]
            
            # Now replace the whole DialogHeader block
            header_regex = re.compile(r'<DialogHeader>.*?</DialogHeader>', re.DOTALL)
            
            new_header = f"""<DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-2 rounded-2xl bg-primary/10 text-primary">
              <{icon} className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {desc}
              </DialogDescription>
            </div>
          </DialogHeader>"""
            
            # If the current header doesn't already have flex-row, replace it
            if 'className="flex flex-row' not in content:
                content = header_regex.sub(new_header, content)
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Updated {file}")

