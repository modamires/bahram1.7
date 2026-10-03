import { label } from "../art/Assets.js";
import { CHARACTER_RENDER } from "../art/Bahram.js";

const STORY = [
  ["بهرام از پرتال گذشت…", "و به باغ واژه‌های آشنا رسید!"],
  ["کتاب، قلم، معلم…", "این واژه‌ها را هر روز در فارسی به کار می‌بریم."],
  ["ریشهٔ این واژه‌های آشنا عربی است.", "فارسی و عربی، واژه‌های مشترک بسیاری دارند."],
  ["با یادگیری عربی،", "معنی بسیاری از واژه‌های فارسی را هم بهتر می‌فهمیم."],
];

export class FinaleScene extends Phaser.Scene {
  constructor() { super("Finale"); }
  init({ levelScene, result }) {
    this.levelScene = levelScene;
    this.result = result;
    this.finished = false;
    this.beat = 0;
  }
  create() {
    this.game.display?.applyCamera(this);
    this.still = this.game.progress.settings.reducedMotion;
    this.game.inputSystem.clear();
    this.game.inputSystem.active = false;
    this.game.audio.pause(false);
    this.createBackdrop();
    this.add.image(640, 360, "finale-garden");
    this.add.image(112, 514, "plant-valley").setOrigin(0.5, 1).setScale(0.8);
    this.add.image(1135, 514, "plant-valley").setOrigin(0.5, 1).setScale(0.85);
    this.portal = this.add.image(210, 514, "goal-sky").setOrigin(0.5, 1).setDisplaySize(235, 280);
    this.hero = this.add.sprite(this.still ? 430 : 215, 530, "player-idle-0")
      .setOrigin(0.5, 1).setScale(CHARACTER_RENDER.menuScale * 0.84)
      .play(this.still ? "player-idle" : "player-run");
    this.add.image(837, 438, "finale-book");
    label(this, 952, 469, "عربی", { size: 26, width: 140, height: 46, color: "#1b6471" });
    label(this, 724, 469, "فارسی", { size: 26, width: 140, height: 46, color: "#1b6471" });
    label(this, 640, 65, "باغ واژه‌های آشنا", { size: 43, width: 880, height: 74, color: "#173f58" });
    label(this, 640, 128, "کشف آخر بهرام • پیوند فارسی و عربی", { size: 24, width: 840, height: 50, color: "#376c77" });
    this.words = ["کتاب", "قلم", "معلم"].map((word, i) =>
      label(this, 635 + i * 202, 278, word, {
        width: 172, height: 91, size: 43, color: "#244958", bg: "#fff6d9",
      }).setDepth(5).setAlpha(0));
    this.sparkles = Array.from({ length: 15 }, (_, i) => this.add
      .image(550 + (i * 83) % 555, 210 + (i * 47) % 285, "particle")
      .setScale(0.45 + (i % 3) * 0.2).setTint(0xffd883).setAlpha(0));
    this.storyLines = STORY.map(lines => lines.map((text, i) => label(this, 640, 563 + i * 47, text, {
      width: 1130, height: 55, size: i ? 31 : 30, color: "#173f58",
    }).setVisible(false)));
    this.game.ui.finale(this);
    this.showBeat(0);
    if (!this.still) {
      this.cameras.main.fadeIn(650, 234, 252, 247);
      this.tweens.add({ targets: this.hero, x: 430, duration: 2700, ease: "Sine.easeOut",
        onComplete: () => this.hero.play("player-idle") });
      this.tweens.add({ targets: this.portal, alpha: 0.32, duration: 3500, delay: 2300 });
    }
    this.time.delayedCall(3200, () => {
      this.showBeat(1);
      this.words.forEach((word, i) => {
        if (this.still) word.setAlpha(1);
        else {
          word.y = 390;
          this.tweens.add({ targets: word, alpha: 1, y: 278, duration: 1000, delay: i * 550, ease: "Back.easeOut" });
        }
      });
      this.sparkles.forEach(spark => spark.setAlpha(0.7));
      if (!this.still) this.hero.play("player-collect").once("animationcomplete", () => this.hero.play("player-idle"));
      this.game.audio.effect("collect");
    });
    this.time.delayedCall(7500, () => this.showBeat(2));
    this.time.delayedCall(12000, () => {
      this.showBeat(3);
      if (!this.still) this.hero.play("player-victory");
      this.game.audio.effect("correct");
      this.game.ui.celebrate();
    });
    this.time.delayedCall(20000, () => this.showResults());
  }
  createBackdrop() {
    if (!this.textures.exists("finale-garden")) {
      const texture = this.textures.createCanvas("finale-garden", 1280, 720), c = texture.context;
      const sky = c.createLinearGradient(0, 0, 0, 720);
      sky.addColorStop(0, "#d4f5f0"); sky.addColorStop(0.58, "#e8efff"); sky.addColorStop(1, "#d6eddf");
      c.fillStyle = sky; c.fillRect(0, 0, 1280, 720);
      const glow = c.createRadialGradient(820, 335, 20, 820, 335, 360);
      glow.addColorStop(0, "#fff9dfff"); glow.addColorStop(1, "#fff9df00");
      c.fillStyle = glow; c.fillRect(0, 0, 1280, 720);
      for (const [y, color] of [[470, "#b1dcd7"], [509, "#8fc9bd"]]) {
        c.fillStyle = color; c.beginPath(); c.moveTo(0, y);
        c.bezierCurveTo(310, y - 85, 845, y + 80, 1280, y - 30);
        c.lineTo(1280, 720); c.lineTo(0, 720); c.fill();
      }
      c.fillStyle = "#f6fff1"; c.beginPath(); c.ellipse(645, 518, 580, 25, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#fffdf1f5"; c.beginPath(); c.roundRect(55, 528, 1170, 111, 25); c.fill();
      texture.refresh();
    }
    if (!this.textures.exists("finale-book")) {
      const texture = this.textures.createCanvas("finale-book", 440, 172), c = texture.context;
      c.fillStyle = "#52928f"; c.beginPath(); c.ellipse(220, 143, 207, 18, 0, 0, Math.PI * 2); c.fill();
      for (const direction of [-1, 1]) {
        c.save(); c.translate(220, 0); c.scale(direction, 1);
        c.fillStyle = "#d0a067"; c.beginPath(); c.moveTo(0, 153); c.lineTo(201, 128);
        c.lineTo(189, 39); c.quadraticCurveTo(80, 16, 0, 64); c.closePath(); c.fill();
        c.fillStyle = "#fff5d8"; c.beginPath(); c.moveTo(0, 141); c.lineTo(191, 118);
        c.lineTo(179, 29); c.quadraticCurveTo(77, 7, 0, 55); c.closePath(); c.fill();
        c.strokeStyle = "#c4b286"; c.lineWidth = 3; c.lineCap = "round";
        for (let i = 0; i < 3; i++) {
          c.beginPath(); c.moveTo(29, 64 + i * 20); c.quadraticCurveTo(90, 40 + i * 20, 157, 53 + i * 20); c.stroke();
        }
        c.restore();
      }
      texture.refresh();
    }
  }
  showBeat(index) {
    this.beat = index;
    this.storyLines.forEach((lines, i) => lines.forEach(line => line.setVisible(i === index)));
    const story = document.getElementById("finale-story");
    if (story) story.textContent = STORY[index].join(" ");
  }
  showResults() {
    if (this.finished) return;
    this.finished = true;
    this.game.audio.pause(true);
    this.game.ui.clearTransient();
    this.game.ui.results(this.levelScene, this.result);
    this.scene.stop();
  }
  update(time) {
    if (this.still) return;
    if (this.beat >= 2) this.words.forEach((word, i) => word.y = 278 + Math.sin(time / 950 + i) * 7);
    this.sparkles.forEach((spark, i) => spark.rotation = time / 1100 + i);
  }
}
