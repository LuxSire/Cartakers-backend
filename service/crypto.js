const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
// const secretKey = 'dI2jI6fM4pV0yQ7bN9zW3pO1vX2mZ4gE'; 
// const secretKeyHex = 'dI2jI6fM4pV0yQ7bN9zW3pO1vX2mZ4gE'; 

const secretKey =  process.env['ENC_DEC_KEY']; 
const secretKeyHex =  process.env['ENC_DEC_KEY']; 
const iv = crypto.randomBytes(16);

const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {
  // Extract the IV and content from the hash
  const ivHex = hash.iv;
  const contentHex = hash.content;

  // Convert the IV and secret key from hexadecimal to bytes
  const iv = Buffer.from(ivHex, 'hex');
//  const secretKey = Buffer.from(secretKeyHex, 'hex');


  // Create a decipher with the correct IV and secret key
  const decipher = crypto.createDecipheriv(algorithm, secretKeyHex, iv);

  // Convert the content from hexadecimal to bytes
  const content = Buffer.from(contentHex, 'hex');

  // Decrypt the content
  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);

  return decrypted.toString(); // Assuming the decrypted data is a string
};

// const decrypt = (hash, secretKeyHex) => {

//   // Extract the IV and content from the hash
//   const ivHex = hash.slice(0, 32); // Assuming IV is 16 bytes (32 hexadecimal characters)
//   const contentHex = hash.slice(32);

//   // Convert the IV from hexadecimal to bytes
//   const iv = Buffer.from(ivHex, 'hex');

//   console.log(hash);
//   console.log('Hexadecimal Secret Key:', secretKeyHex);

//   // Convert the secretKeyHex to a Buffer
//   const secretKey = Buffer.from(secretKeyHex, 'hex');
//   console.log('length:', secretKey.length);

//   const decipher = crypto.createDecipheriv(algorithm, secretKeyHex, iv);

//   // Convert the content from hexadecimal to bytes
//   const content = Buffer.from(contentHex, 'hex');

//   // Decrypt the content
//   const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);

//   return decrypted.toString();
// };

const cipher = (text) => {

    var val = '';
  
      switch (text) {
          case 'a':
            val = '11'  
            break;
           case 'b':
            val = '24'  
            break;
           case 'c':
            val = '22'  
            break;
          case 'd':
            val = '13'  
            break;
          case 'e':
            val = '3'  
            break;
          case 'f':
            val = '14'  
            break;
          case 'g':
            val = '15'  
            break;  
          case 'h':
          val = '16'  
          break;
          case 'i':
          val = '8'  
          break;  
          case 'j':
          val = '17'  
          break;
          case 'k':
          val = '18'  
          break;
          case 'l':
          val = '19'  
          break;
          case 'm':
          val = '26'  
          break;
          case 'n':
          val = '25'  
          break;
          case 'o':
          val = '9'  
          break;
          case 'p':
          val = '10'  
          break;
          case 'q':
          val = '1'  
          break;
          case 'r':
          val = '4'  
          break; 
          case 's':
          val = '12'  
          break;   
          case 't':
          val = '5'  
          break;
          case 'u':
          val = '7'  
          break;
          case 'v':
          val = '23'  
          break;
          case 'w':
          val = '2'  
          break;
          case 'x':
          val = '21'  
          break;
          case 'y':
          val = '6'  
          break;
          case 'z':
          val = '20'  
          break;             
          case '@':
          val = '99'  
          break; 
          case '.':
          val = '97'  
          break;
          case '-':
          val = '96'  
          break;
          case '_':
          val = '95'  
          break; 
          case '1':
          val = 'q'  
          break;
          case '2':
          val = 'w'  
          break;
          case '3':
          val = 'e'  
          break;
          case '4':
          val = 'r'  
          break;
          case '5':
          val = 't'  
          break;
          case '6':
          val = 'y'  
          break;
          case '7':
          val = 'u'  
          break;
          case '8':
          val = 'i'  
          break;
          case '9':
          val = 'o'  
          break;
          case '0':
            val = '$'  
            break;                      
          default:
            //   try {
            //       if(text.match(/^-?\d+$/)){ // if a number
            //                val = text;
            //         }
            // } catch (error) {
                
            // }
            
        }
  
        return val;
  
  };
  
  const decipher = (text) => {
  
      var val = '';
    
        switch (text) {
            case '11':
              val = 'a'  
              break;
             case '24':
              val = 'b'  
              break;
             case '22':
              val = 'c'  
              break;
            case '13':
              val = 'd'  
              break;
            case '3':
              val = 'e'  
              break;
            case '14':
              val = 'f'  
              break;
            case '15':
              val = 'g'  
              break;  
            case '16':
            val = 'h'  
            break;
            case '8':
            val = 'i'  
            break;  
            case '17':
            val = 'j'  
            break;
            case '18':
            val = 'k'  
            break;
            case '19':
            val = 'l'  
            break;
            case '26':
            val = 'm'  
            break;
            case '25':
            val = 'n'  
            break;
            case '9':
            val = 'o'  
            break;
            case '10':
            val = 'p'  
            break;
            case '1':
            val = 'q'  
            break;
            case '4':
            val = 'r'  
            break; 
            case '12':
            val = 's'  
            break;   
            case '5':
            val = 't'  
            break;
            case '7':
            val = 'u'  
            break;
            case '23':
            val = 'v'  
            break;
            case '2':
            val = 'w'  
            break;
            case '21':
            val = 'x'  
            break;
            case '6':
            val = 'y'  
            break;
            case '20':
            val = 'z'  
            break;             
            case '99':
            val = '@'  
            break; 
            case '97':
            val = '.'  
            break;
            case '96':
            val = '-'  
            break;
            case '95':
            val = '_'  
            break;
            case 'q':
          val = '1'  
          break;
          case 'w':
          val = '2'  
          break;
          case 'e':
          val = '3'  
          break;
          case 'r':
          val = '4'  
          break;
          case 't':
          val = '5'  
          break;
          case 'y':
          val = '6'  
          break;
          case 'u':
          val = '7'  
          break;
          case 'i':
          val = '8'  
          break;
          case 'o':
          val = '9'  
          break;
          case '$':
            val = '0'  
            break;                   
            default:
                // try {
                //       if(text.match(/^-?\d+$/)){ // if a number
                //                val = text;
                //         }
                // } catch (error) {
                    
                // }
            
              
          }
    
          return val;
    
    };

module.exports = {
    encrypt,
    decrypt,
    cipher,
    decipher
};