// Every new page visit starts at night; manual choice lasts for this page only.
document.documentElement.dataset.theme = 'dark';
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#060607');
