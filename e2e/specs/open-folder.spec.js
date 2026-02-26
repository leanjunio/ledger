describe('Open folder and see tree', () => {
  it('shows sidebar with at least one folder when root is set', async () => {
    const sidebar = await $('[data-testid="sidebar-tree"]');
    await sidebar.waitForDisplayed({ timeout: 10000 });
    const rows = await $$('[data-testid="sidebar-tree"] [data-testid="tree-row"]');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const firstRow = await rows[0].getText();
    expect(firstRow).toMatch(/notes/);
  });
});
