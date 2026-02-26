describe('Open folder and see tree', () => {
  it('shows sidebar with at least one folder when root is set', async () => {
    const sidebar = await $('nav.sidebar-tree');
    await sidebar.waitForDisplayed({ timeout: 10000 });
    const rows = await $$('nav.sidebar-tree .tree-row');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const firstRow = await rows[0].getText();
    expect(firstRow).toMatch(/notes/);
  });
});
