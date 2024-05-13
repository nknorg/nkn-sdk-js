"use strict";

const PingData = "ping";
const PongData = "pong";

export default class Peer {
  config;
  pc; // peer connection
  dc; // data channel
  sdp;
  isConnected;
  // compatible to websocket
  onopen;
  onmessage;
  onclose;
  onerror;

  send(data) {
    this.dc.send(data);
  }

  constructor(stunServerAddr) {
    const config = {
      iceServers: [{ urls: stunServerAddr }],
    };
    this.config = config;
    this.isConnected = false;
  }

  async offer(label) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.pc || this.pc.signalingState === "closed") {
          this.pc = new RTCPeerConnection(this.config);
        }

        this.pc.oniceconnectionstatechange = () => {
          if (this.pc.iceConnectionState === "failed") {
            this.pc.restartIce();
          }
        };

        this.dc = this.pc.createDataChannel(label);

        this.dc.addEventListener("open", () => {
          this.isConnected = true;
          if (this.onopen) {
            this.onopen();
          }
        });

        this.dc.addEventListener("message", (e) => {
          if (e.data == PongData) {
            if (this.pongHandler != null) {
              this.pongHandler(PongData);
            } else {
              console.log("Pong handler not set");
            }
            return;
          } else if (e.data == PingData) {
            this.dc.send(PongData);
            return;
          }
          if (this.onmessage) {
            this.onmessage(e);
          }
        });

        this.dc.addEventListener("close", (event) => {
          this.isConnected = false;
          if (this.onclose) {
            this.onclose();
          }
        });

        this.dc.addEventListener("error", (event) => {
          if (this.onerror) {
            this.onerror(event);
          }
        });

        await this.pc.createOffer();

        await this.pc.setLocalDescription();

        this.sdp = btoa(JSON.stringify(this.pc.localDescription));

        resolve(this.sdp);
      } catch (err) {
        reject(err);
      }
    });
  }

  setRemoteDescription(sdp) {
    const answer = JSON.parse(atob(sdp));
    return this.pc.setRemoteDescription(answer);
  }

  close() {
    this.dc.close();
    this.pc.close();
  }
}
