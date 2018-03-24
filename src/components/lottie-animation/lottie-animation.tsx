import { Component, Prop, State, Method, Element } from '@stencil/core';
import lottie from 'lottie-web';

@Component({
  tag: 'lottie-animation',
  styleUrl: 'lottie-animation.css'
})
export class LottieAnimation {
  @Element() element: HTMLElement;
  @Element() progress: HTMLElement;

  @Prop() src: string;
  @Prop() loop: boolean;
  @Prop() count: number;
  @Prop() autoplay: boolean;
  @Prop() controls: boolean;
  @Prop() renderer: string = "svg";
  @Prop() speed: number = 1;
  @Prop() direction: number = 1;

  @State() __paused: boolean = false;

  @State() settings: Object = {};

  @State() io: IntersectionObserver;
  @State() status: string;
  @State() lottie: any;
  @State() duration: any;
  @State() currentTime: any;
  @State() mouseDown: any;

  componentDidLoad() {
    this.update({ container: this.element.querySelector('.animation') })
    this.load();
    this.setSpeed(this.speed);
    this.setDirection(this.direction);

    if (this.autoplay) {
      this.addIntersectionObserver();
    }
  }

  load () {
    this.lottie = lottie.loadAnimation(this.settings);

    if (this.controls) {
      this.lottie.addEventListener("data_ready", () => { this.handleDataReady() });
      this.lottie.addEventListener("enterFrame", () => { this.handleNewFrame() });
    }
  }

  handleDataReady () {
    this.duration = this.lottie.totalFrames / this.lottie.frameRate;
  }

  handleNewFrame () {
    this.currentTime = this.lottie.currentFrame / this.lottie.frameRate;
  }

  addIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver((data: any) => {
        // because there will only ever be one instance
        // of the element we are observing
        // we can just use data[0]
        if (data[0].isIntersecting) {
          this.play();
        } else {
          this.pause();
        }
      })

      this.io.observe(this.element.querySelector('.animation'));
    } else {
      // fall back to setTimeout for Safari and IE
      setTimeout(() => {
        this.handleVisible();
      }, 300);
    }
  }

  handleVisible() {
    this.pause();
  }

  removeIntersectionObserver() {
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
  }

  @Method()
  play() {
    this.status = "play";
    this.lottie.play()
  }

  @Method()
  pause() {
    this.__paused = true;
    this.status = "pause";
    this.lottie.pause()
  }

  @Method()
  stop() {
    this.status = "stop";
    this.lottie.stop()
  }

  @Method()
  setSpeed(value: number = 1) {
    this.lottie.setSpeed(value);
  }

  @Method()
  setDirection(value: number = 1) {
    this.lottie.setDirection(value);
  }

  @Method()
  rendererSettings(settings) {
    this.settings = settings;
    this.lottie = this.settings
  }

  @Method()
  instance() {
    return this.lottie;
  }

  @Method()
  update(settings) {
    this.settings = {
      renderer: this.renderer,
      loop: this.count ? this.count : this.loop,
      autoplay: this.autoplay,
      path: this.src,
      rendererSettings: {
        scaleMode: 'noScale',
        clearCanvas: false,
        progressiveLoad: true,
        hideOnTransparent: true
      },
      ...settings
    };
  }

  handleProgressClick(e) {
      var x = e.offsetX;
      let clickedValue = (x / this.progress.offsetWidth) * 1000;
      clickedValue = this.duration * clickedValue;

      if (this.lottie.isPaused && this.__paused) {
        this.lottie.goToAndStop(clickedValue, false)
      } else {
        this.lottie.goToAndPlay(clickedValue, false)
      }
  }

  round (number) {
    var factor = Math.pow(10, 4);
    return Math.round(number * factor) / factor;
  }

  renderControls() {
    return (
      <div class="controls">
        <button onClick={() => { this.lottie.isPaused ? this.play() : this.pause() }}>{this.lottie.isPaused ? "Play" : "Pause"}</button>
        <button onClick={() => { this.stop() }}>Stop</button>
        <div class="seek">
          <progress max="100" value={(this.currentTime / this.duration) * 100} onMouseDown={() => { this.mouseDown = true; this.pause(); this.__paused = true; }} onMouseMove={(e) => { if (this.mouseDown) { this.handleProgressClick(e); } }} onMouseUp={() => { this.mouseDown = false; this.play(); }} onBlur={() => {this.mouseDown = false;}}>
            <div class="progress-bar">
              <p class="duration">{this.round(this.duration)}</p>
              <span style={{"width": `${(this.currentTime / this.duration) * 100}%`}}>
                <p class="currentTime">{this.round(this.currentTime)}</p>
              </span>
            </div>
          </progress>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div class="animation" data-status={this.status}></div>
        {this.lottie && this.controls && this.renderControls()}
      </div>
    );
  }
}
