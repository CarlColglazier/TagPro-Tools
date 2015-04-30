module.exports = () => {
    'use strict';
    class PlayerSprite {
        constructor(player, sprite_id, text, x, y) {
            this.sprites = player.sprites;
            this.type = sprite_id;
            this.text = (typeof text === 'function') ? text() : text;
            this.x = x;
            this.y = y;
        }
        add () {
            if (!this.sprites) {
                return;
            }
            if (!this.sprites[this.type] && this.text) {
                this.sprites[this.type] = tagpro.renderer.prettyText(this.text);
                this.sprites.info.addChild(this.sprites[this.type]);
            }
            if (this.sprites[this.type]) {
                this.sprites[this.type].x = this.x;
                this.sprites[this.type].y = this.y;
            }
        }
        remove() {
            if (!this.sprites) {
                return;
            }
            if (this.sprites[this.type]) {
                this.sprites.info.removeChild(this.sprites[this.type]);

                // Make sure nothing gets lost while the sprite is being removed.
                this.sprites[this.type] = null;
            }
        }
        update(text) {
            this.text = (typeof text === 'function') ? text() : text;
        }
        updatePlayer(sprite) {
            this.sprites = sprite;
        }
        value() {
            return this.text;
        }
    }
    class PlayerDraw extends PlayerSprite {
        constructor(player, sprite_id, text, x, y) {
            super(player, sprite_id, text, x, y);
            if (!player) {
                return;
            }
            wait(player.sprites, () => {
                super.updatePlayer(player.sprites);
                super.add();
            });
        }
        update(text) {
            super.update(text);
            super.remove();
            super.add();
        }
        value() {
            return super.value();
        }
    }
    return {
        onPlayer: (player, sprite_id, text, x, y) => {
            return new PlayerDraw(player, sprite_id, text, x, y);
        }
    };
};
