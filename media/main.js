const offsetWidth = 40;
const offsetHeight = 20;

function buildIframe(vncUrl) {
    let iframe = document.createElement('iframe');
    iframe.width = window.innerWidth - offsetWidth;
    iframe.height = window.innerHeight - offsetHeight;
    iframe.style.border = 'none';
    iframe.src = vncUrl;
    //for local testing
    // iframe.src = 'http://localhost:13147/containers-vnc/175535d2553e/vnc_lite.html?path=containers-vnc/175535d2553e&resize=remote';
    document.body.append(iframe);

    //resize our vnc window to the vs code webview
    window.onresize = () => {
        iframe.width = window.innerWidth - offsetWidth;
        iframe.height = window.innerHeight - offsetHeight;
    };
}


// Handle the message inside the webview
window.addEventListener('message', (event) => {
    const message = event.data; // The JSON data our extension sent
    let vncUrl = message.vncUrl;
    buildIframe(vncUrl);
});