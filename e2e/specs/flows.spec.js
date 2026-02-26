describe('Select folder and see file list', () => {
  it('clicking a folder shows file list with .md files', async () => {
    const treeRow = await $('nav.sidebar-tree .tree-row');
    await treeRow.waitForDisplayed({ timeout: 5000 });
    await treeRow.click();
    await browser.pause(500);
    const fileRows = await $$('.file-list .file-name');
    expect(fileRows.length).toBeGreaterThanOrEqual(1);
    const firstFile = await fileRows[0].getText();
    expect(firstFile).toMatch(/\.md$/);
  });
});

describe('Create new file', () => {
  it('New file adds untitled.md to list', async () => {
    const newBtn = await $('button*=New file');
    await newBtn.waitForDisplayed({ timeout: 5000 });
    await newBtn.click();
    await browser.pause(500);
    const fileNames = await $$('.file-name');
    const texts = await Promise.all(fileNames.map((el) => el.getText()));
    expect(texts.some((t) => t.includes('untitled.md'))).toBe(true);
  });
});

describe('Open file and editor', () => {
  it('clicking a file shows editor and preview', async () => {
    const fileRow = await $('.file-list .file-name');
    await fileRow.waitForDisplayed({ timeout: 5000 });
    await fileRow.click();
    await browser.pause(500);
    const editor = await $('.editor-textarea');
    await editor.waitForDisplayed({ timeout: 5000 });
    const preview = await $('.preview-content');
    await preview.waitForDisplayed({ timeout: 5000 });
    const previewText = await preview.getText();
    expect(previewText.length).toBeGreaterThan(0);
  });
});

describe('Edit and save', () => {
  it('typing and Save updates content', async () => {
    const textarea = await $('.editor-textarea');
    await textarea.waitForDisplayed({ timeout: 5000 });
    await textarea.addValue(' - edited');
    const saveBtn = await $('button*=Save');
    await saveBtn.click();
    await browser.pause(300);
    const preview = await $('.preview-content');
    const text = await preview.getText();
    expect(text).toMatch(/edited/);
  });
});

describe('Delete file', () => {
  it('Delete button is present per file row', async () => {
    const backBtn = await $('button*=Back');
    await backBtn.waitForDisplayed({ timeout: 5000 });
    await backBtn.click();
    await browser.pause(500);
    const deleteBtns = await $$('.delete-btn');
    expect(deleteBtns.length).toBeGreaterThanOrEqual(1);
  });
});
