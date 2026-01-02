# How to Manage Artworks on Your Website

This guide explains how to add, remove, and re-order artworks on your portfolio website using GitHub. No coding experience required!

---

## Table of Contents
1. [Understanding How It Works](#understanding-how-it-works)
2. [How to Add a New Artwork](#how-to-add-a-new-artwork)
3. [How to Remove an Artwork](#how-to-remove-an-artwork)
4. [How to Re-order Artworks](#how-to-re-order-artworks)
5. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
6. [Troubleshooting](#troubleshooting)

---

## Understanding How It Works

Your website displays artworks based on two things:

1. **The images folder** (`images/`) — This is where all your artwork photos are stored
2. **The artworks.json file** — This is a list that tells the website which images to show, in what order, and with what information (title, year, medium)

Think of `artworks.json` like a catalogue or index card system. Each artwork has an "index card" with:
- `id` — A unique number (just needs to be different from other artworks). **This does NOT affect display order** — it's just an internal reference number.
- `title` — The name of the artwork
- `year` — When it was created
- `medium` — What type of artwork it is (Oil, Sketch, Charcoal, etc.)
- `image` — The path to the image file

**The order artworks appear on your website is determined by their order in the artworks.json file** — first entry appears first, second entry appears second, and so on. The `id` numbers are irrelevant to ordering.

---

## How to Add a New Artwork

### Step 1: Prepare Your Image
- Make sure your image is a JPG, JPEG, or PNG file
- Give it a simple filename with **no spaces** (use hyphens or underscores instead)
  - ✅ Good: `my-new-painting.jpg`, `portrait_2025.jpg`
  - ❌ Bad: `my new painting.jpg`, `Portrait (Final Version).jpg`

### Step 2: Upload the Image to GitHub

1. Go to your repository on GitHub (github.com)
2. Click on the **`images`** folder to open it
3. Click the **"Add file"** button (top right area)
4. Select **"Upload files"**
5. Drag and drop your image, or click "choose your files" to select it
6. Scroll down and click the green **"Commit changes"** button
7. Wait for the upload to complete

### Step 3: Add the Artwork to the List

1. Go back to the main page of your repository
2. Click on the file called **`artworks.json`**
3. Click the **pencil icon** (✏️) to edit the file
4. Find where you want to add your new artwork in the list
5. Add a new entry. Here's the format:

```json
{"id": 62, "title": "Your Artwork Title", "year": 2025, "medium": "Oil", "image": "images/your-image-filename.jpg"},
```

**Important formatting rules:**
- Each entry must be on its own line
- Each entry (except the very last one) must end with a comma `,`
- The very last entry in the list should NOT have a comma after it
- The filename in `"image"` must exactly match what you uploaded (including uppercase/lowercase)

### Step 4: Save Your Changes

1. Scroll down to the "Commit changes" section
2. You can add a short description like "Added new artwork: [title]"
3. Click the green **"Commit changes"** button

### Step 5: Wait for the Website to Update

Your website will automatically update within a few minutes. Be patient!

---

## How to Remove an Artwork

### Step 1: Remove the Entry from artworks.json

1. Go to your repository on GitHub
2. Click on **`artworks.json`**
3. Click the **pencil icon** (✏️) to edit
4. Find the line for the artwork you want to remove
5. Delete the entire line (from the `{` to the `},`)
6. **Important:** Check the artwork that's now last in the list — if it has a comma at the end, remove that comma
7. Click **"Commit changes"**

### Step 2: (Optional) Delete the Image File

If you want to completely remove the image from your repository:

1. Go to the **`images`** folder
2. Click on the image file you want to delete
3. Click the **three dots** (⋯) or **trash icon** in the top right
4. Select **"Delete file"**
5. Click **"Commit changes"**

> **Note:** You can leave the image file in the folder if you might want to use it again later. It won't appear on the website if it's not in artworks.json.

---

## How to Re-order Artworks

The order of artworks on your website matches the order in `artworks.json`. The first entry appears first (top-left), and so on.

> **Important Note:** The `id` number does NOT affect the order. It's just a unique identifier used internally by the website. You could have `id: 99` first and `id: 1` last — they'd still display in that order. To change the display order, you need to move the actual lines in the file.

### Step 1: Edit artworks.json

1. Go to your repository on GitHub
2. Click on **`artworks.json`**
3. Click the **pencil icon** (✏️) to edit

### Step 2: Move the Lines

1. Find the artwork entry you want to move
2. **Select the entire line** (from `{` to `},`)
3. **Cut** it (Ctrl+X on Windows, Cmd+X on Mac)
4. **Paste** it (Ctrl+V / Cmd+V) in the new position

**Example:** To move "Luke" from position 1 to position 5, cut the entire line and paste it after the 4th entry.

### Step 3: Fix the Commas

After moving lines, check:
- Every line **except the last one** should end with a comma `,`
- The **last line** should NOT have a comma

### Step 4: Save Changes

1. Click **"Commit changes"**
2. Wait a few minutes for the website to update

---

## Common Mistakes to Avoid

### ❌ DON'T: Use Spaces in Filenames
- Bad: `my painting.jpg`
- Good: `my-painting.jpg` or `my_painting.jpg`

### ❌ DON'T: Forget the Comma Rules
Every entry needs a comma at the end, EXCEPT the very last one.

**Wrong:**
```json
{"id": 1, "title": "Painting A", "year": 2025, "medium": "Oil", "image": "images/a.jpg"}
{"id": 2, "title": "Painting B", "year": 2025, "medium": "Oil", "image": "images/b.jpg"},
```

**Correct:**
```json
{"id": 1, "title": "Painting A", "year": 2025, "medium": "Oil", "image": "images/a.jpg"},
{"id": 2, "title": "Painting B", "year": 2025, "medium": "Oil", "image": "images/b.jpg"}
```
(Note: First has comma, last doesn't)

### ❌ DON'T: Mismatch the Image Filename
The filename in artworks.json must **exactly** match the actual file:
- If your file is `IMG_1234.JPG` (uppercase JPG), write `"images/IMG_1234.JPG"`
- If your file is `portrait.jpeg`, write `"images/portrait.jpeg"` (not `.jpg`)

### ❌ DON'T: Forget the Quotation Marks
All text values need quotation marks around them:
- ✅ `"title": "My Painting"`
- ❌ `"title": My Painting`

Numbers don't need quotes:
- ✅ `"year": 2025`
- ❌ `"year": "2025"` (this works but isn't ideal)

### ❌ DON'T: Delete the Square Brackets
The file must start with `[` and end with `]` — never delete these!

### ❌ DON'T: Use Curly Quotes
Use straight quotes `"` not curly quotes `"` or `"`
- If you copy/paste from Word or an email, the quotes might be wrong
- Type them directly in GitHub to be safe

### ❌ DON'T: Think the ID Controls the Order
The `id` number is just a unique identifier — it has nothing to do with where the artwork appears on the website. To change the order, move the lines in the file. Don't waste time renumbering IDs!

### ❌ DON'T: Edit Multiple Things at Once (When Starting Out)
Make one change at a time. Add one artwork, save, check the website. Then add the next one. This makes it easier to spot if something goes wrong.

---

## Troubleshooting

### "The website isn't updating"
- Wait 5-10 minutes — GitHub Pages can take time to refresh
- Try a hard refresh in your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear your browser cache

### "My new image isn't showing"
- Check the filename matches exactly (including uppercase/lowercase)
- Check you included `images/` at the start of the path
- Make sure the image actually uploaded to the images folder

### "The whole website is broken"
This usually means there's a syntax error in artworks.json. Common causes:
- Missing or extra comma
- Missing quotation mark
- Missing bracket `{` or `}`

**To fix:** Go to artworks.json on GitHub, click "History" to see previous versions, and you can restore an older working version.

### "I can't find the edit button"
Make sure you're logged into GitHub and that you're the owner of the repository (or have been given edit permissions).

---

## Quick Reference: Artwork Entry Format

```json
{"id": NUMBER, "title": "TITLE", "year": YEAR, "medium": "TYPE", "image": "images/FILENAME.jpg"},
```

**Example:**
```json
{"id": 62, "title": "Portrait of Rose", "year": 2025, "medium": "Oil", "image": "images/rose-portrait.jpg"},
```

**Medium options currently used:**
- `"Oil"`
- `"Sketch"`
- `"Charcoal"`

(You can add new mediums — they'll automatically appear in the filter buttons on the website)

---

## Need More Help?

If something goes wrong and you can't fix it, don't panic! GitHub keeps a history of all changes. You can always go back to a previous version of any file by clicking on the file, then clicking "History" to see all past versions.
