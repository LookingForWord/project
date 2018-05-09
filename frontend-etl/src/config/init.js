var script = document.createElement('script');
script.src = 'config/config.js?t=' + new Date().getTime();
document.head.appendChild(script);

window.addEventListener('load', function () {
    initLogo();
    initTheme();
}, false);

/**
 * 初始化logo
 */
function initLogo() {
    var logo = window.LOGOCLASS || 'logo_hs';
    document.body.classList.add(logo);
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    if (logo.indexOf('logo_fly') !== -1) {
        link.href = 'frontend-common/assets/images/fly.ico';
    } else if (logo.indexOf('logo_wcqk') !== -1) {
        link.href = 'frontend-common/assets/images/wcqk.ico';
    } else if (logo.indexOf('logo_zgdx') !== -1) {
        link.href = 'frontend-common/assets/images/zgdx.png';
    } else if (logo.indexOf('logo_hs') !== -1) {
        link.href = 'frontend-common/assets/images/wcqk.ico';
    }
    document.head.appendChild(link);

    document.title = window.TITLE || '文创清科大数据平台'
}

function initTheme() {
    if (window.THEME) {
        document.body.classList.add(window.THEME);
    }
}
