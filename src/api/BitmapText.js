Phaser.BitmapText.prototype.anchor = new Phaser.Point();

Phaser.BitmapText.prototype.update = function () {

	if (this.anchor !== null) {
		this.updateTransform();

		this.pivot.x = this.anchor.x * this.textWidth;
		this.pivot.y = this.anchor.y * this.textHeight;
	}

};