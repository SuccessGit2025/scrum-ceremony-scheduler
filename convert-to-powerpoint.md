# Convert Presentation to PowerPoint

## Method 1: Using Pandoc (Recommended)

### Install Pandoc
**Windows:**
```bash
# Using Chocolatey
choco install pandoc

# Or download from: https://pandoc.org/installing.html
```

**Mac:**
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt-get install pandoc
```

### Convert to PowerPoint
```bash
pandoc PRESENTATION.md -o "Scrum-Ceremony-Scheduler-Presentation.pptx"
```

### Advanced Conversion (Better Formatting)
```bash
pandoc PRESENTATION.md -o "Scrum-Ceremony-Scheduler-Presentation.pptx" \
  --slide-level=2 \
  --reference-doc=template.pptx
```

## Method 2: Online Converters

### Option A: Pandoc Try (Online)
1. Go to: https://pandoc.org/try/
2. Paste the content from `PRESENTATION.md`
3. Select "from: markdown" and "to: pptx"
4. Click "Convert"
5. Download the generated PowerPoint file

### Option B: Markdown to PowerPoint Converters
- **Marp**: https://marp.app/ (Markdown presentation ecosystem)
- **GitPitch**: https://gitpitch.com/ (GitHub-based presentations)
- **Slides.com**: https://slides.com/ (Online presentation editor)

## Method 3: Manual Copy-Paste

### Quick Steps:
1. Open PowerPoint
2. Create new presentation
3. Copy sections from `PRESENTATION.md`
4. Format as slides manually

## Method 4: Using Marp (Markdown Presentations)

### Install Marp CLI
```bash
npm install -g @marp-team/marp-cli
```

### Convert with Marp
```bash
marp PRESENTATION.md --pptx -o "Scrum-Ceremony-Scheduler-Presentation.pptx"
```

## Recommended Approach

**For best results, use Pandoc:**

1. **Install Pandoc** (see above)
2. **Run conversion:**
   ```bash
   pandoc PRESENTATION.md -o "Scrum-Ceremony-Scheduler-Presentation.pptx" --slide-level=2
   ```
3. **Open in PowerPoint** and adjust formatting as needed

## Expected Output

The PowerPoint will have:
- Title slide
- Individual slides for each major section
- Bullet points preserved
- Basic formatting maintained
- Ready for customization

## Post-Conversion Tips

After converting:
1. **Add company branding** (logos, colors)
2. **Adjust slide layouts** for better visual appeal
3. **Add images or charts** to enhance key points
4. **Review slide breaks** and combine/split as needed
5. **Add speaker notes** for presentation delivery

## Troubleshooting

### If Pandoc isn't available:
- Use the online Pandoc converter
- Or manually create slides in PowerPoint

### If formatting looks off:
- Open the .pptx file in PowerPoint
- Use "Design" tab to apply themes
- Manually adjust layouts as needed

### For better slide breaks:
- Edit `PRESENTATION.md` to add `---` where you want slide breaks
- Then re-run the conversion