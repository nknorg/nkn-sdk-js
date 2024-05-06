'use strict';

const PingData = "ping";
const PongData = "pong";

export default class Peer {
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

  constructor(stunServerAddr){
    const config = {
      iceServers: [{ urls: stunServerAddr }],
    };
    this.pc = new RTCPeerConnection(config);
    this.isConnected = false;
  }

  async offer(label){
    return new Promise(async (resolve, reject) => {
      if (!this.pc) {
        return false
      }

      try {
        this.pc.oniceconnectionstatechange = () => {
          if (this.pc.iceConnectionState === 'failed') {
            this.pc.restartIce();
          }
        }

        await this.pc.createOffer();
        this.pc.onnegotiationneeded = async () => {
          await this.pc.setLocalDescription();
          this.sdp = btoa(JSON.stringify(this.pc.localDescription));
          resolve(this.sdp);
        }

        this.dc = this.pc.createDataChannel(label)

        this.dc.addEventListener('open', (event) => {
          this.isConnected = true;
          if (this.onopen) {
            this.onopen();
          }
        })

        this.dc.addEventListener('message', (e) => {
          if (e.data == PongData) {
            if (this.pongHandler != null) {
              this.pongHandler(PongData)
            } else {
              console.log("Pong handler not set")
            }
            return
          } else if (e.data == PingData) {
            this.dc.send(PongData)
            return
          }
          if (this.onmessage) {
            this.onmessage(e);
          }
        })

        this.dc.addEventListener('close', (event) => {
          this.isConnected = false;
          if (this.onclose) {
            this.onclose();
          }
        })

        this.dc.addEventListener('error', (event) => {
          if (this.onerror) {
            this.onerror(event);
          }
        })

      } catch (err) {
        reject(err);
      }
    })
  }

  setRemoteDescription(sdp){
    const answer = JSON.parse(atob(sdp));
    return this.pc.setRemoteDescription(answer)
  }

  setSdpReadyHandler(handler){
    this.sdpReadyHandler = handler;
  }

  close(){
    this.dc.close();
    this.pc.close();
  }
}
