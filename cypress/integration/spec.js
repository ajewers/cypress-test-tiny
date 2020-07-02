/// <reference types="cypress" />

// Jimp to load image from buffer
import Jimp from 'jimp/es';

// QR Code reader to parse QR code image
import QRReader from 'qrcode-reader';

const qr = new QRReader();

// Path to screenshot
let qrImagePath = '';

// Promisify QR parsing
function decodeQR(img) {
  return new Promise((resolve, reject) => {
    qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
    qr.decode(img.bitmap);
  });
}

describe('Screenshotting and parsing a QR code', () => {
    it('works', () => {
      // Wikipedia page on QR codes
      cy.visit('https://en.wikipedia.org/wiki/QR_code');

      // Screenshot one of the larger QR codes and attempt to parse
      cy.get(':nth-child(5) > [style="width: 255px"] > .thumb')
        .screenshot('qr-screenshot', {
          onAfterScreenshot($el, props) {
            qrImagePath = props.path;
          }
        })
        .then(() => cy.readFile(qrImagePath, 'base64'))
        .then(qrBase64 => Buffer.from(qrBase64, 'base64'))
        .then(imageBuffer => Jimp.read(imageBuffer))
        .then(qrImg => decodeQR(qrImg))
        .then(value => cy.log(value.result));
    });
});
