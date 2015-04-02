module.exports = () => {
    'use strict';
    if (!location.port || parseInt(location.port, 10) < 8000) {
        return {};
    }
    tagpro.socket.on('chat', (msg) => {
        document.dispatchEvent(new CustomEvent('chat', {detail: msg}));
        if (msg.to === 'team') {
            document.dispatchEvent(new CustomEvent('chatteam', {detail: msg}));
        } else if (msg.from) {
            document.dispatchEvent(new CustomEvent('chatall', {detail: msg}));
        }
    });
    tagpro.socket.on('end', (msg) => {
        document.dispatchEvent(new CustomEvent('end', {detail: msg}));
    });
    tagpro.socket.on('mapupdate', (msg) => {
        for (let new_update of msg) {
            switch (new_update.v) {
            case 6.1:
            case 6.2:
            case 6.3:
            case 6.4:
                document.dispatchEvent(new CustomEvent('powerupspawn', {detail: new_update}));
                break;
            case 6:
                document.dispatchEvent(new CustomEvent('poweruptaken', {detail: new_update}));
                break;
            }
            document.dispatchEvent(new CustomEvent('mapupdate', {detail: new_update}));
        }
    });
    tagpro.socket.on('p', (msg) => {
        if (!msg.u) {
            return;
        }
        document.dispatchEvent(new CustomEvent('gameupdate', {detail: msg.u}));
        for (let player of msg.u) {
            if (msg.length) {
                document.dispatchEvent(new CustomEvent('playerjoin', {detail: player}));
            } else {
                document.dispatchEvent(new CustomEvent('playerupdate', {detail: player}));
            }
        }
    });
    tagpro.socket.on('playerLeft', (msg) => {
        document.dispatchEvent(new CustomEvent('playerleft', {detail: msg}));
    });
    tagpro.socket.on('score', (msg) => {
        document.dispatchEvent(new CustomEvent('score', {detail: msg}));
    });
    tagpro.socket.on('spawn', (msg) => {
        document.dispatchEvent(new CustomEvent('spawn', {detail: msg}));
    });
    tagpro.socket.on('splat', (msg) => {
        document.dispatchEvent(new CustomEvent('splat', {detail: msg}));
    });
    tagpro.socket.on('time', (msg) => {
        document.dispatchEvent(new CustomEvent('gametime', {detail: msg}));
    });
    tagpro.socket.on('end', (msg) => {
        document.dispatchEvent(new CustomEvent('gameend', {detail: msg}));
    });
    tagpro.socket.on('sound', (msg) => {
        document.dispatchEvent(new CustomEvent('sound', {detail: msg}));
        switch (msg.s) {
        case 'pop':
            document.dispatchEvent(new CustomEvent('pop'));
            break;
        case 'popOther':
            document.dispatchEvent(new CustomEvent('popother'));
            break;
        case 'switchOn':
            document.dispatchEvent(new CustomEvent('switchon'));
            break;
        case 'dynamite':
            document.dispatchEvent(new CustomEvent('dynamite'));
            break;
        case 'friendlydrop':
            document.dispatchEvent(new CustomEvent('friendlydrop'));
            break;
        case 'cheering':
            document.dispatchEvent(new CustomEvent('cheering'));
            break;
        case 'burst':
            document.dispatchEvent(new CustomEvent('burst'));
            break;
        }
    });
};
