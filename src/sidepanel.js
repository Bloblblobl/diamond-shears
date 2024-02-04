const q = document.querySelector.bind(document);

async function setup() {
    const vaultInput = q('#vault');
    const urlInput = q('#url');
    const pathPrefixInput = q('#path-prefix');
    const noteNameInput = q('#note-name');
    const embedInput = q('#embed');
    const submitButton = q('form button');

    // Get the URL of the active tab and set it as the value of the URL input.
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length === 0) return;
        const tab = tabs[0];
        if (!tab.url) return;            
        urlInput.value = tab.url;
    });

    // Get the vault value from local storage and set it as the value of the
    // vault input.
    chrome.storage.local.get(['vault'], ({vault}) => {
        vaultInput.value = vault || '';
    });

    // Listen to changes in the active-tab-url in session storage and set the
    // value of the URL input whenever it changes.
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'session' && changes['active-tab-url']) {
            urlInput.value = changes['active-tab-url'].newValue;
        }
    });

    // Set the value of the vault input in local storage whenever it changes,
    // since the vault is the most reused and we want it to persist.
    vaultInput.addEventListener('change', () => {
        const vault = vaultInput.value;
        chrome.storage.local.set({vault});
    });

    submitButton.addEventListener('click', e => {
        // Get the data from the form and open a new Obsidian note with it.
        e.preventDefault();
        const vault = encodeURIComponent(vaultInput.value);
        const embed = embedInput.checked;
        const url = urlInput.value;
        const content = encodeURIComponent(embed ? `![[${url}]]` : url);

        const pathPrefix = pathPrefixInput.value;
        const noteName = noteNameInput.value;
        const filePath = encodeURIComponent(
            pathPrefix ? `${pathPrefix}/${noteName}` : noteName
        );

        const queryParams = new URLSearchParams({vault, file: filePath, content});
        const obsidianUri = `obsidian://new?${queryParams.toString()}`;
        chrome.tabs.create({url: obsidianUri});
    });
}

document.addEventListener('DOMContentLoaded', setup);