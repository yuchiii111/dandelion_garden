// import * as TWEEN from '@tweenjs/tween.js'
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js'

export const animateCamera = (camera, control, endPosition, endTarget, duration, callback, endPosition1, endTarget1, isAnimating) => {
    control.enabled = false;

    let tween2 = new TWEEN.Tween({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      tx: control.target.x,
      ty: control.target.y,
      tz: control.target.z,
    })
    .to({
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      tx: endTarget.x,
      ty: endTarget.y,
      tz: endTarget.z,
    }, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function (obj) {
      // setTimeout(() => {
      //   isAnimating.current = true;
      // }, 100); 
      camera.position.set(obj.x, obj.y, obj.z);
      control.target.set(obj.tx, obj.ty, obj.tz);
      control.update();
    })

    if(endPosition1&&endTarget1){
      let tween1 = new TWEEN.Tween({
        x: endPosition.x,
        y: endPosition.y,
        z: endPosition.z,
        tx: endTarget.x,
        ty: endTarget.y,
        tz: endTarget.z,
      })
      tween1.to({
        x: endPosition1.x,
        y: endPosition1.y,
        z: endPosition1.z,
        tx: endTarget1.x,
        ty: endTarget1.y,
        tz: endTarget1.z,
      }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut);
      // tween1.easing(TWEEN.Easing.Cubic.InOut);
      tween1.onUpdate(function (obj) {
        camera.position.set(obj.x, obj.y, obj.z);
        control.target.set(obj.tx, obj.ty, obj.tz);
        control.update();
      })
      tween1.onComplete(function () {
        if(typeof callback === 'function'){
          callback();
        }
        
        control.enabled = true; 
        // showNodesInDetail.current = true;
      });
      tween2.chain(tween1);
      tween2.onComplete(function () {
        // isAnimating.current = true;
      });
      
    } else {
      tween2.onComplete(function () {
      control.enabled = true; 
    });
    }
    
   
    tween2.start();
};