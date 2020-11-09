"use strict";/**
 * Discord Debate Timer
 * @copyright 2020 Luke Zhang
 * @author Luke Zhang luke-zhang-04.github.io/
 * @version 1.2.0
 * @license BSD-3-Clause
 */const minute=60,formatTime=a=>{const b=a%minute,c=(a-b)/minute,d=10>b?`0${b}`:b.toString();return 0<c?`${c}:${d}`:a.toString()};class Timer extends DeStagnate.Component{constructor(a){super(a),this._intervalId=0,this.spacebar=()=>{this.state.paused?this.startTimer():clearInterval(this._intervalId),this.setState({paused:!this.state.paused})},this.startTimer=()=>{const a=setInterval(()=>{this.setState({time:this.state.time+1})},1e3);this._intervalId=+`${a}`},this.speechStatus=()=>{if(30>=this.state.time||270<=this.state.time&&300>this.state.time)return DeStagnate.createElement("p",{class:"status"},"Protected Time");return 300<=this.state.time?DeStagnate.createElement("p",{class:"status"},"Times up!"):void 0},this.reset=()=>{clearInterval(this._intervalId),this.setState({paused:!0,time:0})},this.render=()=>{if(0===this.state.time&&this.state.paused)return[DeStagnate.createElement("h1",{class:"header"},"Debate Timer"),DeStagnate.createElement("p",{class:"subheader"},"Space to pause/start. r to restart.")];const a=this.speechStatus(),b=DeStagnate.createElement("div",{class:"container"},DeStagnate.createElement("p",{class:"time"},formatTime(this.state.time)),DeStagnate.createElement("p",{class:"status"},this.state.paused?"Paused":""),a?a:null);return b},this.state={time:0,paused:!0}}}const root=document.getElementById("root");if(root){const a=new Timer(root);a.mount(),document.addEventListener("keydown",b=>{" "===b.key?a.spacebar():"r"===b.key&&a.reset()})}else alert("Could not load timer. Something went wrong: #root not found x_x.");