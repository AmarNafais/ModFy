import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import path from 'path';

dotenv.config();

const requiredSmtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
const missingSmtp = requiredSmtpVars.filter(k => !process.env[k]);
if (missingSmtp.length > 0) {
  throw new Error(`Missing required SMTP environment variables: ${missingSmtp.join(', ')}\nPlease set them before starting the server.`);
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    const secure = (process.env.SMTP_SECURE === 'true') || port === 465;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
      // Additional TLS settings for better compatibility with services like Zoho
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      }
    });
  }
  return transporter;
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
  try {
    const { email, firstName, lastName } = userData;
    const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'there';

    const welcomeEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 20px;
          background: #ffffff;
        }
        .welcome-text {
          font-size: 24px;
          font-weight: 300;
          color: #1a1a1a;
          margin-bottom: 20px;
        }
        .description {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
        }
        .cta-button {
          display: inline-block;
          background: #1a1a1a;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px 20px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #1a1a1a;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div style="text-align: center; margin-bottom: 10px;">
            <img src="cid:logo@modfy" alt="MODFY" style="height: 75px; display: inline-block;" />
          </div>
          <div style="display: none;">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="225" height="75" viewBox="0 0 450 150" style="display: inline-block;">
              <path d="M0 0 C0.85142578 -0.020625 1.70285156 -0.04125 2.58007812 -0.0625 C7.7209325 -0.0943073 11.47391116 0.19049142 15.8125 3.25 C19.6642644 8.17435268 21.40602999 13.31932691 23.265625 19.2421875 C23.57070984 20.18812775 23.87579468 21.13406799 24.19012451 22.1086731 C25.15635537 25.11138454 26.10958952 28.11803805 27.0625 31.125 C27.71789432 33.16954533 28.37413536 35.21381944 29.03125 37.2578125 C30.63481502 42.25211042 32.22774821 47.24970266 33.8125 52.25 C35.4625 52.58 37.1125 52.91 38.8125 53.25 C41.58243643 47.53077874 43.70874372 41.74438826 45.65234375 35.70703125 C45.90327789 34.93060272 46.15421204 34.15417419 46.41275024 33.35421753 C47.46032807 30.10202267 48.50277116 26.8484038 49.52807617 23.58911133 C50.28632192 21.18676511 51.061789 18.79052329 51.83984375 16.39453125 C52.06397446 15.6662764 52.28810516 14.93802155 52.51902771 14.18769836 C54.35197621 8.60516177 56.86495664 4.04013105 62.05078125 0.890625 C66.04975025 -0.03700006 69.90867298 -0.0391827 74 0 C74.81919922 -0.00773437 75.63839844 -0.01546875 76.48242188 -0.0234375 C82.55906792 -0.00343208 82.55906792 -0.00343208 84.8125 2.25 C85.05973816 4.90673828 85.05973816 4.90673828 85.05541992 8.3203125 C85.06003487 10.23239502 85.06003487 10.23239502 85.06474304 12.18310547 C85.05784508 13.58040547 85.0505781 14.97770369 85.04296875 16.375 C85.04177694 17.80224567 85.04132379 19.22949214 85.0415802 20.65673828 C85.04001492 23.64946394 85.03172206 26.64207004 85.01831055 29.63476562 C85.00132062 33.4750999 84.99749619 37.31530271 84.99825573 41.15567017 C84.99798408 44.1032843 84.99250362 47.05086957 84.98525429 49.99847412 C84.98206723 51.41469097 84.98010013 52.8309111 84.97936058 54.24713135 C84.97719745 56.22466199 84.96766089 58.20218045 84.95776367 60.1796875 C84.95395187 61.30616699 84.95014008 62.43264648 84.94621277 63.59326172 C84.8125 66.25 84.8125 66.25 83.8125 68.25 C81.83340602 68.27686553 79.85421029 68.29633375 77.875 68.3125 C76.77285156 68.32410156 75.67070313 68.33570312 74.53515625 68.34765625 C71.8125 68.25 71.8125 68.25 70.8125 67.25 C70.71903085 65.59261557 70.69505023 63.93125356 70.69897461 62.27124023 C70.69908791 60.67970375 70.69908791 60.67970375 70.69920349 59.05601501 C70.70436478 57.901866 70.70952606 56.74771698 70.71484375 55.55859375 C70.7162587 54.38361832 70.71767365 53.20864288 70.71913147 51.99806213 C70.72475008 48.22784936 70.73730574 44.45769496 70.75 40.6875 C70.7550126 38.13867273 70.75957592 35.58984453 70.76367188 33.04101562 C70.77472556 26.77732367 70.79148179 20.51366601 70.8125 14.25 C67.5188639 16.4457574 67.29398171 16.95394236 66.15844727 20.52856445 C65.87127335 21.41320877 65.58409943 22.29785309 65.28822327 23.20930481 C64.98814865 24.16761703 64.68807404 25.12592926 64.37890625 26.11328125 C64.05969711 27.09741501 63.74048798 28.08154877 63.41160583 29.09550476 C62.04466411 33.31085563 60.70243459 37.53397017 59.3581543 41.7565918 C58.37371727 44.83668101 57.37663989 47.91247854 56.37890625 50.98828125 C56.08085587 51.94052078 55.78280548 52.89276031 55.47572327 53.87385559 C53.67590473 59.41665488 51.91829105 63.9604302 47.05859375 67.54296875 C43.69034986 68.60323335 40.36994041 68.57842954 36.875 68.5625 C36.17181641 68.57861328 35.46863281 68.59472656 34.74414062 68.61132812 C30.22109141 68.61556716 27.2375623 68.27001146 23.8125 65.25 C20.49852944 59.80647063 18.50282452 53.82769148 16.578125 47.7890625 C16.29523621 46.91728363 16.01234741 46.04550476 15.72088623 45.14730835 C15.12976515 43.32134415 14.54168718 41.49439221 13.95654297 39.66650391 C13.05767107 36.85992244 12.14875106 34.05674426 11.23828125 31.25390625 C10.66347644 29.47414751 10.08923714 27.694206 9.515625 25.9140625 C9.24381409 25.07453033 8.97200317 24.23499817 8.69195557 23.37002563 C6.8125 17.48259014 6.8125 17.48259014 6.8125 15.25 C6.1525 15.25 5.4925 15.25 4.8125 15.25 C4.80219254 15.88449066 4.79188507 16.51898132 4.78126526 17.17269897 C4.67333865 23.75846962 4.55872965 30.34409959 4.44018555 36.9296875 C4.39679221 39.38961859 4.35512044 41.84958065 4.31518555 44.30957031 C4.25758943 47.83928784 4.19386443 51.36884876 4.12890625 54.8984375 C4.10383751 56.55629776 4.10383751 56.55629776 4.07826233 58.24765015 C4.05831711 59.26855743 4.03837189 60.28946472 4.01782227 61.34130859 C4.00227798 62.24287689 3.9867337 63.14444519 3.97071838 64.07333374 C3.8125 66.25 3.8125 66.25 2.8125 68.25 C0.83340602 68.27686553 -1.14578971 68.29633375 -3.125 68.3125 C-4.22714844 68.32410156 -5.32929688 68.33570312 -6.46484375 68.34765625 C-9.1875 68.25 -9.1875 68.25 -10.1875 67.25 C-10.28689626 65.19987154 -10.31549553 63.14628608 -10.31689453 61.09375 C-10.32004669 59.77568359 -10.32319885 58.45761719 -10.32644653 57.09960938 C-10.32465675 55.64973925 -10.3226058 54.19986942 -10.3203125 52.75 C-10.32098557 51.27408838 -10.32195563 49.79817687 -10.32321167 48.32226562 C-10.32468848 45.22524971 -10.32253464 42.12826258 -10.31787109 39.03125 C-10.3121738 35.05291451 -10.3154529 31.07464648 -10.32144356 27.09631348 C-10.32504963 24.04752083 -10.32391037 20.99874429 -10.32131577 17.94995117 C-10.32064662 16.48266594 -10.32147447 15.01537926 -10.32379532 13.5480957 C-10.32632257 11.50081407 -10.3217906 9.45352734 -10.31689453 7.40625 C-10.31609894 6.23900391 -10.31530334 5.07175781 -10.31448364 3.86914062 C-10.04271258 -1.73635793 -4.48573488 0.02656246 0 0 Z" fill="#2E3192" transform="translate(20.1875,40.75)"/>
              <path d="M0 0 C1.21854172 -0.00960754 2.43708344 -0.01921509 3.69255066 -0.02911377 C5.02981377 -0.03396321 6.36707906 -0.03824168 7.7043457 -0.04199219 C9.07477317 -0.04774574 10.44520062 -0.05350345 11.81562805 -0.05926514 C14.69316991 -0.0697783 17.57068382 -0.07561806 20.44824219 -0.07910156 C24.12230597 -0.08456967 27.79599603 -0.10855968 31.46994305 -0.13707352 C34.30366564 -0.15577319 37.13729982 -0.16090949 39.97107887 -0.16243744 C41.98008651 -0.16691035 43.98904668 -0.1855269 45.99797058 -0.20440674 C54.17630606 -0.18452183 59.65608772 0.09613215 66.00512695 5.59863281 C69.11521283 9.24187627 70.43576395 11.84917856 70.4831543 16.65087891 C70.495914 17.53214447 70.50867371 18.41341003 70.52182007 19.32138062 C70.52404572 20.26623322 70.52627136 21.21108582 70.52856445 22.18457031 C70.53854965 23.6529686 70.53854965 23.6529686 70.54873657 25.15103149 C70.55885426 27.22046024 70.56355387 29.28992155 70.56323242 31.359375 C70.5676016 34.51780249 70.60391996 37.67482785 70.6418457 40.83300781 C70.64771491 42.84602388 70.65168361 44.85904657 70.65356445 46.87207031 C70.66793549 47.81287445 70.68230652 48.75367859 70.69711304 49.72299194 C70.65784469 55.3872105 70.00652995 58.68493005 66.19262695 63.16113281 C61.43461753 67.4549462 58.22259947 68.28613507 51.90112305 68.29052734 C50.60322845 68.2936795 49.30533386 68.29683167 47.96810913 68.30007935 C46.55076056 68.29828983 45.1334123 68.29623895 43.71606445 68.29394531 C42.26543156 68.2946188 40.81479877 68.29558919 39.36416626 68.29684448 C36.32618127 68.29831843 33.28822571 68.296176 30.25024414 68.29150391 C26.34819394 68.28579662 22.44621236 68.28909383 18.54416466 68.29507637 C15.55027749 68.2986815 12.55640672 68.2975438 9.56251907 68.29494858 C8.1231447 68.2942797 6.68376886 68.29510637 5.24439621 68.29742813 C3.23804501 68.29995493 1.23168861 68.29542389 -0.7746582 68.29052734 C-2.48983139 68.28933395 -2.48983139 68.28933395 -4.23965454 68.28811646 C-6.80737305 68.16113281 -6.80737305 68.16113281 -7.80737305 67.16113281 C-7.90611121 65.1631371 -7.93709104 63.16156123 -7.93237305 61.16113281 C-7.93495117 60.06800781 -7.9375293 58.97488281 -7.94018555 57.84863281 C-7.80737305 55.16113281 -7.80737305 55.16113281 -6.80737305 54.16113281 C-4.95168817 54.05866635 -3.09214416 54.02541876 -1.23364258 54.01928711 C0.55358719 54.00873543 0.55358719 54.00873543 2.37692261 53.99797058 C3.67477692 53.9938063 4.97263123 53.98964203 6.30981445 53.98535156 C7.64642126 53.97493414 8.98302059 53.96351276 10.3196106 53.9511261 C16.00853063 53.89858191 21.69731716 53.85067175 27.38647461 53.83520508 C30.86327536 53.82513167 34.33945701 53.79582361 37.81601334 53.75388527 C39.78740771 53.73555985 41.75896083 53.73822663 43.73043823 53.74113464 C44.92822906 53.72464371 46.1260199 53.70815277 47.36010742 53.69116211 C48.94443069 53.68236275 48.94443069 53.68236275 50.5607605 53.67338562 C53.30163373 53.39412685 53.30163373 53.39412685 55.03190613 51.32453918 C56.66832708 48.27450042 56.59844395 45.79754136 56.6262207 42.34863281 C56.63146255 41.69789795 56.63670441 41.04716309 56.6421051 40.37670898 C56.64850978 39.00506005 56.64720837 37.63335608 56.63867188 36.26171875 C56.63015203 34.1672976 56.6589517 32.07559785 56.69067383 29.98144531 C56.69228588 28.64550863 56.69170824 27.30956713 56.6887207 25.97363281 C56.69057373 24.76320313 56.69242676 23.55277344 56.69433594 22.30566406 C56.0825819 18.47141002 55.20811296 17.53343629 52.19262695 15.16113281 C49.42453047 14.55442454 49.42453047 14.55442454 46.33837891 14.63110352 C45.16068436 14.61461258 43.98298981 14.59812164 42.76960754 14.58113098 C41.50283676 14.5830394 40.23606598 14.58494781 38.9309082 14.58691406 C36.9428483 14.56527805 34.95478843 14.54363828 32.96673107 14.52176952 C30.18653399 14.49621276 27.4063935 14.48891395 24.62609863 14.48120117 C19.74768849 14.46379332 14.86946766 14.41703929 9.99125671 14.37113953 C7.39382469 14.34854983 4.79632311 14.33279316 2.19880676 14.32429504 C1.0305687 14.31726059 -0.13766937 14.31022614 -1.34130859 14.30297852 C-2.89207344 14.29775932 -2.89207344 14.29775932 -4.47416687 14.29243469 C-6.80737305 14.16113281 -6.80737305 14.16113281 -7.80737305 13.16113281 C-7.87981358 11.14149082 -7.89114493 9.11946158 -7.86987305 7.09863281 C-7.86084961 5.99390625 -7.85182617 4.88917969 -7.8425293 3.75097656 C-7.83092773 2.89632812 -7.81932617 2.04167969 -7.80737305 1.16113281 C-5.11599162 -0.1845579 -3.0135784 0.01912568 0 0 Z" fill="#2E3192" transform="translate(203.807373046875,40.8388671875)"/>
              <path d="M0 0 C3.97587947 3.05125634 6.15646481 6.78399333 8.6875 11.0625 C9.32558594 12.114375 9.96367187 13.16625 10.62109375 14.25 C15.6875 22.73138833 15.6875 22.73138833 15.6875 25.0625 C25.72766399 26.41067416 25.72766399 26.41067416 34.90625 23.48046875 C36.46256579 21.08114857 37.56888988 18.69474098 38.6875 16.0625 C39.84872821 13.94372142 41.03720943 11.839692 42.25 9.75 C42.78753906 8.76386719 43.32507813 7.77773438 43.87890625 6.76171875 C46.50460879 2.84301367 49.21048318 0.55483894 53.6875 -0.9375 C55.5389445 -1.05579437 57.39482138 -1.11264861 59.25 -1.125 C60.22066406 -1.13917969 61.19132812 -1.15335938 62.19140625 -1.16796875 C64.6875 -0.9375 64.6875 -0.9375 66.6875 1.0625 C66.91796875 3.375 66.91796875 3.375 66.875 6.0625 C66.86855469 6.949375 66.86210937 7.83625 66.85546875 8.75 C66.6875 11.0625 66.6875 11.0625 65.6875 13.0625 C64.31208552 13.24920536 62.93008497 13.38834657 61.546875 13.50390625 C58.30700458 14.16124338 56.99709349 14.70434125 54.81054688 17.23388672 C53.056337 20.10268667 51.47075968 23.00730426 49.9375 26 C48.87048887 28.015039 47.7927302 30.02443201 46.703125 32.02734375 C46.24196289 32.9205835 45.78080078 33.81382324 45.30566406 34.73413086 C43.39085351 37.48934333 41.71121144 38.64300008 38.6875 40.0625 C34.875 40.25 34.875 40.25 31.6875 40.0625 C31.69273682 40.84488037 31.69797363 41.62726074 31.70336914 42.43334961 C31.72407106 45.95555833 31.73713838 49.4777543 31.75 53 C31.75837891 54.23169922 31.76675781 55.46339844 31.77539062 56.73242188 C31.77861328 57.90224609 31.78183594 59.07207031 31.78515625 60.27734375 C31.79039307 61.36136475 31.79562988 62.44538574 31.80102539 63.56225586 C31.6875 66.0625 31.6875 66.0625 30.6875 67.0625 C28.66785801 67.13494053 26.64582876 67.14627188 24.625 67.125 C23.52027344 67.11597656 22.41554688 67.10695313 21.27734375 67.09765625 C20.42269531 67.08605469 19.56804687 67.07445313 18.6875 67.0625 C17.3566089 64.40071779 17.57481007 62.37510604 17.58984375 59.3984375 C17.59306641 58.27695313 17.59628906 57.15546875 17.59960938 56 C17.61217773 54.2365625 17.61217773 54.2365625 17.625 52.4375 C17.62951172 51.25414062 17.63402344 50.07078125 17.63867188 48.8515625 C17.65048533 45.92182493 17.66695742 42.99218728 17.6875 40.0625 C16.29567505 40.10383057 16.29567505 40.10383057 14.87573242 40.14599609 C10.80085911 40.03927991 8.45304468 38.95610438 5.6875 36.0625 C2.91880399 31.73949735 0.69294616 27.12051679 -1.54882812 22.5078125 C-4.12467719 17.29455872 -4.12467719 17.29455872 -8.66943359 14.00488281 C-10.89714784 13.52786187 -13.04797596 13.27122016 -15.3125 13.0625 C-16.3125 12.0625 -16.3125 12.0625 -16.41015625 9.33984375 C-16.39855469 8.23769531 -16.38695312 7.13554688 -16.375 6 C-16.36597656 4.89527344 -16.35695313 3.79054688 -16.34765625 2.65234375 C-16.33605469 1.79769531 -16.32445312 0.94304688 -16.3125 0.0625 C-11.54646139 -2.3205193 -4.96590524 -1.40544488 0 0 Z" fill="#F5821F" transform="translate(374.3125,41.9375)"/>
              <path d="M0 0 C5.529863 5.529863 5.15960731 9.53687677 5.203125 17.046875 C5.20882507 17.81751282 5.21452515 18.58815063 5.22039795 19.38214111 C5.22981635 21.00930421 5.23636933 22.63648611 5.24023438 24.26367188 C5.24991442 26.72821129 5.28095641 29.19190683 5.3125 31.65625 C5.43698416 49.68814714 5.43698416 49.68814714 0.28125 56.15625 C-0.3065625 56.5996875 -0.894375 57.043125 -1.5 57.5 C-2.0878125 57.9640625 -2.675625 58.428125 -3.28125 58.90625 C-6.65220176 61.05140112 -9.59256531 61.13427797 -13.4777832 61.16113281 C-14.59937332 61.17074036 -15.72096344 61.1803479 -16.87654114 61.19024658 C-18.69528999 61.1966214 -18.69528999 61.1966214 -20.55078125 61.203125 C-21.79748093 61.20882507 -23.0441806 61.21452515 -24.32865906 61.22039795 C-26.96906179 61.22985166 -29.60935076 61.23674653 -32.24975586 61.24023438 C-34.95301781 61.24462437 -37.65596153 61.25853566 -40.35913086 61.28125 C-44.25644633 61.31171079 -48.15336 61.32228257 -52.05078125 61.328125 C-53.25720779 61.3404718 -54.46363434 61.3528186 -55.70661926 61.36553955 C-66.05733526 61.33807515 -66.05733526 61.33807515 -71 58 C-71 55 -71 55 -69.23135376 52.9921875 C-62.51906784 47.27737437 -57.80116763 45.8376133 -49.0859375 46 C-47.99028473 45.98912354 -46.89463196 45.97824707 -45.76577759 45.96704102 C-42.30115991 45.94105754 -38.83953495 45.96962203 -35.375 46 C-33.01170357 45.99190097 -30.64841655 45.98021721 -28.28515625 45.96484375 C-22.5228971 45.93512303 -16.76209039 45.95005772 -11 46 C-9.99608324 42.31940786 -9.87075296 39.01375214 -9.8671875 35.1875 C-9.86623077 34.53676514 -9.86527405 33.88603027 -9.86428833 33.21557617 C-9.86360982 31.84391177 -9.86544113 30.47224411 -9.86962891 29.10058594 C-9.87498188 27.00708774 -9.86967284 24.91380407 -9.86328125 22.8203125 C-9.86394209 21.48437453 -9.86522337 20.14843669 -9.8671875 18.8125 C-9.86831543 17.60207031 -9.86944336 16.39164063 -9.87060547 15.14453125 C-9.90103537 11.82226762 -9.90103537 11.82226762 -11 8 C-7.37 5.36 -3.74 2.72 0 0 Z" fill="#2E3192" transform="translate(187,48)"/>
              <path d="M0 0 C1.15129898 -0.00428513 2.30259796 -0.00857025 3.48878479 -0.01298523 C5.91870467 -0.01871717 8.3486417 -0.01923719 10.77856445 -0.01489258 C14.48744079 -0.01173278 18.19551906 -0.03520664 21.90429688 -0.06054688 C24.26953025 -0.06282005 26.63476576 -0.06352328 29 -0.0625 C30.10435898 -0.07170975 31.20871796 -0.08091949 32.34654236 -0.09040833 C38.37326979 -0.05435469 42.73146999 0.43053147 48.06640625 3.30078125 C48.06640625 7.30078125 48.06640625 7.30078125 46.48506165 9.19464111 C40.31641509 14.19148922 35.8850246 15.28907798 28.046875 15.09765625 C26.51538567 15.10542084 26.51538567 15.10542084 24.95295715 15.11334229 C21.71893199 15.12516354 18.48766988 15.09082636 15.25390625 15.05078125 C12.00285812 15.03201826 8.75239158 15.02327734 5.501297 15.03106689 C3.4856938 15.03374354 1.46998585 15.02002087 -0.54536438 14.98797607 C-1.91280037 14.98377655 -1.91280037 14.98377655 -3.30786133 14.97949219 C-4.10678299 14.96948181 -4.90570465 14.95947144 -5.72883606 14.94915771 C-8.54504798 15.39829841 -9.90642211 16.31496331 -11.93359375 18.30078125 C-12.16668836 21.00448613 -12.16480007 23.29062225 -11.97265625 25.96875 C-11.9122866 27.51750992 -11.85375197 29.06634226 -11.796875 30.61523438 C-11.68570745 33.04843248 -11.55927397 35.47797083 -11.39892578 37.90844727 C-10.55831519 51.42298504 -10.55831519 51.42298504 -14.08105469 56.23291016 C-16.6421159 58.37022876 -18.85377476 60.01991056 -21.93359375 61.30078125 C-24.93359375 60.30078125 -24.93359375 60.30078125 -26.10009766 58.31176758 C-27.23380423 54.21627747 -27.25839655 50.35706927 -27.26953125 46.125 C-27.27951645 44.79901543 -27.27951645 44.79901543 -27.28970337 43.44624329 C-27.29980684 41.57949903 -27.3045211 39.71271883 -27.30419922 37.84594727 C-27.30856341 35.00801185 -27.3448818 32.17164403 -27.3828125 29.33398438 C-27.38868317 27.51432819 -27.39265089 25.69466468 -27.39453125 23.875 C-27.40890228 23.0351506 -27.42327332 22.19530121 -27.43807983 21.33000183 C-27.38453007 14.33211731 -25.56307636 8.93026386 -20.55859375 3.92578125 C-13.93893456 -0.17210301 -7.560145 -0.00622784 0 0 Z" fill="#2E3192" transform="translate(135.93359375,40.69921875)"/>
              <path d="M0 0 C1.55136909 -0.00945648 1.55136909 -0.00945648 3.13407898 -0.019104 C4.23943497 -0.01505554 5.34479095 -0.01100708 6.48364258 -0.00683594 C7.62601883 -0.00874939 8.76839508 -0.01066284 9.94538879 -0.01263428 C12.35519634 -0.01399331 14.76501127 -0.01031655 17.17480469 -0.00195312 C20.87492155 0.00877963 24.57455613 -0.00187337 28.2746582 -0.01464844 C30.61515407 -0.01332737 32.95564964 -0.01076608 35.29614258 -0.00683594 C36.9632856 -0.01290863 36.9632856 -0.01290863 38.66410828 -0.019104 C39.68889786 -0.01279968 40.71368744 -0.00649536 41.76953125 0 C42.67378342 0.00159119 43.57803558 0.00318237 44.50968933 0.00482178 C46.69067383 0.25878906 46.69067383 0.25878906 48.69067383 2.25878906 C48.92114258 4.82519531 48.92114258 4.82519531 48.87817383 7.82128906 C48.87172852 8.81257813 48.8652832 9.80386719 48.85864258 10.82519531 C48.69067383 13.25878906 48.69067383 13.25878906 47.69067383 14.25878906 C46.1722038 14.36570959 44.64889518 14.40499612 43.12670898 14.41650391 C42.15545074 14.42676605 41.1841925 14.4370282 40.1835022 14.44760132 C38.59763809 14.45855331 38.59763809 14.45855331 36.97973633 14.46972656 C34.76358308 14.49779327 32.54743735 14.52645772 30.33129883 14.55566406 C26.81990756 14.59697455 23.30865666 14.63384165 19.79711914 14.66015625 C16.42019321 14.68768812 13.0439148 14.73356092 9.66723633 14.78222656 C8.61404205 14.78547943 7.56084778 14.7887323 6.47573853 14.79208374 C5.00939468 14.81693344 5.00939468 14.81693344 3.51342773 14.84228516 C2.65262604 14.85037201 1.79182434 14.85845886 0.90493774 14.86679077 C-1.78617425 15.34320702 -2.67830569 16.10051585 -4.30932617 18.25878906 C-4.79658844 20.65374691 -4.79658844 20.65374691 -4.78588867 23.32910156 C-4.83229492 24.79669922 -4.83229492 24.79669922 -4.87963867 26.29394531 C-4.89768555 27.31359375 -4.91573242 28.33324219 -4.93432617 29.38378906 C-4.98510508 31.40732842 -5.03958671 33.43077945 -5.09838867 35.45410156 C-5.11595215 36.3514502 -5.13351562 37.24879883 -5.15161133 38.17333984 C-5.30932617 40.25878906 -5.30932617 40.25878906 -6.30932617 41.25878906 C-8.30732189 41.35752722 -10.30889775 41.38850705 -12.30932617 41.38378906 C-13.40245117 41.38636719 -14.49557617 41.38894531 -15.62182617 41.39160156 C-18.30932617 41.25878906 -18.30932617 41.25878906 -19.30932617 40.25878906 C-19.59257353 35.86974247 -19.54122186 31.46837499 -19.55932617 27.07128906 C-19.57995117 25.83830078 -19.60057617 24.6053125 -19.62182617 23.33496094 C-19.62698242 22.14064453 -19.63213867 20.94632813 -19.63745117 19.71582031 C-19.64679688 18.62245361 -19.65614258 17.52908691 -19.66577148 16.40258789 C-19.07767077 11.21562019 -17.17055206 8.08257035 -13.43432617 4.50878906 C-8.96332293 1.28966673 -5.50124789 0.0096549 0 0 Z" fill="#F5821F" transform="translate(298.309326171875,67.7412109375)"/>
              <path d="M0 0 C0.69919052 -0.00335861 1.39838104 -0.00671722 2.11875916 -0.01017761 C4.44125115 -0.01971426 6.76367126 -0.02163208 9.08618164 -0.02270508 C10.69421926 -0.0259158 12.30225659 -0.02927972 13.91029358 -0.03279114 C17.28558022 -0.03878922 20.66084122 -0.04063035 24.03613281 -0.04003906 C28.36865089 -0.03993741 32.70100522 -0.05359016 37.03348446 -0.07081127 C40.35596985 -0.08191084 43.6784154 -0.0839589 47.00091743 -0.08342934 C48.5985629 -0.08461252 50.19620929 -0.08905315 51.79383659 -0.0967617 C54.02543595 -0.10652055 56.25667655 -0.10370005 58.48828125 -0.09765625 C60.39570351 -0.09979378 60.39570351 -0.09979378 62.34165955 -0.10197449 C65.30883789 0.14526367 65.30883789 0.14526367 67.30883789 2.14526367 C67.53930664 4.71166992 67.53930664 4.71166992 67.49633789 7.70776367 C67.48989258 8.69905273 67.48344727 9.6903418 67.47680664 10.71166992 C67.30883789 13.14526367 67.30883789 13.14526367 66.30883789 14.14526367 C64.0443441 14.24493953 61.77669578 14.27326198 59.51000977 14.2746582 C58.79945938 14.27641052 58.088909 14.27816284 57.35682678 14.27996826 C54.99705598 14.28438645 52.63735952 14.28144892 50.27758789 14.27807617 C48.64473455 14.27874922 47.01188131 14.27971925 45.37902832 14.28097534 C41.95246428 14.28245227 38.52592626 14.28029793 35.09936523 14.27563477 C30.69729288 14.26993748 26.29528148 14.27321651 21.89321136 14.27920723 C18.52015724 14.28281299 15.14711767 14.28167419 11.77406311 14.27907944 C10.15047702 14.27841021 8.52688962 14.27923845 6.90330505 14.28155899 C4.63805619 14.28408576 2.37290739 14.28024461 0.10766602 14.2746582 C-1.8297345 14.27346481 -1.8297345 14.27346481 -3.80627441 14.27224731 C-6.69116211 14.14526367 -6.69116211 14.14526367 -7.69116211 13.14526367 C-7.78990027 11.14726795 -7.8208801 9.14569209 -7.81616211 7.14526367 C-7.81874023 6.05213867 -7.82131836 4.95901367 -7.82397461 3.83276367 C-7.56933588 -1.31992581 -4.50860143 0.01352346 0 0 Z" fill="#F5821F" transform="translate(286.691162109375,40.854736328125)"/>
            </svg>
          </div>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Premium Men's Innerwear</p>
        </div>
        
        <div class="content">
          <h1 class="welcome-text">Welcome to MODFY, ${name}!</h1>
          
          <p class="description">
            Thank you for joining our exclusive community of men who value premium comfort and sophisticated style.
          </p>
          
          <p>At MODFY, we believe that true luxury begins with what you wear closest to your skin. Our carefully curated collection of premium innerwear combines the finest materials with modern design, ensuring you feel confident and comfortable all day long.</p>
          
          <p>What makes MODFY special:</p>
          <ul style="color: #666; margin: 20px 0;">
            <li>Premium fabrics including Egyptian Cotton, Micro Mesh, and Cashmere</li>
            <li>Thoughtfully designed for the modern gentleman</li>
            <li>Sustainable and ethically sourced materials</li>
            <li>Uncompromising attention to detail and quality</li>
          </ul>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://your-domain.replit.app/shop" class="cta-button">Explore Our Collection</a>
          </div>
          
          <p>We're thrilled to have you as part of the MODFY family. If you have any questions or need assistance, our customer service team is here to help.</p>
          
          <p style="margin-top: 40px;">
            Welcome aboard,<br>
            <strong>The MODFY Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>MODFY</strong> - Redefining Men's Innerwear</p>
          
          <div class="social-links">
            <a href="#">Instagram</a> |
            <a href="#">Facebook</a> |
            <a href="#">Twitter</a>
          </div>
          
          <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
            You're receiving this email because you signed up for a MODFY account.<br>
            If you didn't sign up, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: {
        name: 'MODFY - Premium Innerwear',
        address: process.env.SMTP_USER!
      },
      to: email,
      subject: 'Welcome to MODFY - Your Premium Journey Begins',
      html: welcomeEmailHTML,
      text: `Welcome to MODFY, ${name}! Thank you for joining our exclusive community of men who value premium comfort and sophisticated style. Explore our collection at https://your-domain.replit.app/shop`,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'storage', 'logo', 'logo.png'),
          cid: 'logo@modfy'
        }
      ]
    };
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

export async function sendOrderConfirmationEmail(orderData: {
  orderNumber: string;
  totalAmount: string;
  customerName: string;
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    size?: string;
    price: string;
    imageUrl: string;
  }>;
  customerEmail?: string;
}): Promise<boolean> {
  try {
    const orderConfirmationEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 20px;
          background: #ffffff;
        }
        .order-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .order-item {
          border-bottom: 1px solid #e9ecef;
          padding: 20px 0;
          margin: 10px 0;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .product-details {
          line-height: 1.8;
        }
        .product-price {
          text-align: right;
        }
        .total {
          font-weight: bold;
          font-size: 18px;
          color: #1a1a1a;
          text-align: right;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #1a1a1a;
        }
        .address-block {
          background: #fff;
          border: 1px solid #e9ecef;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div style="text-align: center; margin-bottom: 10px;">
            <img src="cid:logo@modfy" alt="MODFY" style="height: 50px; display: inline-block;" />
          </div>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Premium Men's Innerwear</p>
        </div>
        
        <div class="content">
          <h1>Order Confirmation - ${orderData.orderNumber}</h1>
          
          <p>Hi ${orderData.customerName},</p>
          
          <p>A new order has been received! Details below:</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            
            <h4>Items Ordered:</h4>
            ${orderData.items.map(item => `
              <table class="order-item" width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #e9ecef; padding: 20px 0; margin: 10px 0;">
                <tr>
                  <td width="100" style="padding: 0 15px 0 0; vertical-align: top; background-color: #f5f5f5;">
                    <img src="${item.imageUrl}" alt="${item.productName}" width="80" height="80" style="width: 80px !important; height: 80px !important; max-width: 80px; max-height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef; display: block; background-color: #f5f5f5;" border="0">
                  </td>
                  <td style="vertical-align: top; padding-right: 15px;">
                    <strong style="font-size: 15px; color: #333;">${item.productName}</strong><br>
                    ${item.size ? `<span style="color: #666; font-size: 14px; display: block; margin-top: 5px;">Size: ${item.size}</span>` : ''}
                    <span style="color: #666; font-size: 14px; display: block; margin-top: 5px;">Quantity: ${item.quantity}</span>
                  </td>
                  <td width="120" style="text-align: right; vertical-align: top;">
                    <strong style="color: #333;">LKR ${(parseFloat(item.price) * item.quantity).toFixed(2)}</strong><br>
                    <span style="color: #666; font-size: 14px;">LKR ${item.price} each</span>
                  </td>
                </tr>
              </table>
            `).join('')}
            
            <div class="total">
              Total: LKR ${orderData.totalAmount}
            </div>
          </div>
          
          <div class="address-block">
            <h4>Delivery Address:</h4>
            <p style="margin: 5px 0;">${orderData.deliveryAddress.fullName}</p>
            <p style="margin: 5px 0;">${orderData.deliveryAddress.addressLine1}</p>
            ${orderData.deliveryAddress.addressLine2 ? `<p style="margin: 5px 0;">${orderData.deliveryAddress.addressLine2}</p>` : ''}
            <p style="margin: 5px 0;">${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.postalCode}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderData.deliveryAddress.phoneNumber}</p>
            ${orderData.customerEmail || (orderData.deliveryAddress as any).email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${orderData.customerEmail ?? (orderData.deliveryAddress as any).email}</p>` : ''}
          </div>
          
          <p>Please process this order promptly.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; color: #888; font-size: 14px;">
          <p>© 2024 MODFY. All rights reserved.</p>
          <p>Premium Men's Innerwear - Comfort Redefined</p>
        </div>
      </div>
    </body>
    </html>
    `;

    if (orderData.customerEmail) {
      const customerMailOptions = {
        from: {
          name: 'MODFY',
          address: process.env.SMTP_USER!
        },
        to: orderData.customerEmail,
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        html: orderConfirmationEmailHTML.replace('A new order has been received!', 'Thank you for your order!').replace('Please process this order promptly.', 'We will contact you shortly on WhatsApp to confirm payment and delivery details.'),
        text: `Thank you for your order! Order Number: ${orderData.orderNumber} for LKR ${orderData.totalAmount}. We will contact you shortly to confirm payment and delivery.`,
        attachments: [
          {
            filename: 'logo.png',
            path: path.join(process.cwd(), 'storage', 'logo', 'logo.png'),
            cid: 'logo@modfy'
          }
        ]
      };

      await getTransporter().sendMail(customerMailOptions);
    }

    const adminMailOptions = {
      from: {
        name: 'MODFY - Order System',
        address: process.env.SMTP_USER!
      },
      to: process.env.ADMIN_EMAIL!,
      subject: `New Order Received - ${orderData.orderNumber}`,
      html: orderConfirmationEmailHTML,
      text: `New order received: ${orderData.orderNumber} for LKR ${orderData.totalAmount}. Customer: ${orderData.customerName}`,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'storage', 'logo', 'logo.png'),
          cid: 'logo@modfy'
        }
      ]
    };
    await getTransporter().sendMail(adminMailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(params: {
  to: string;
  orderNumber: string;
  newStatus: string;
  customerName?: string;
  message?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: string;
    imageUrl?: string;
  }>;
}): Promise<boolean> {
  try {
    const { to, orderNumber, newStatus, customerName = '', message = '', items = [] } = params;

    const statusEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; }
        .content { padding: 30px 20px; background: #fff; }
        .status { font-weight: 700; color: #1a1a1a; }
        .note { margin-top: 15px; color: #555; }
        .order-item { display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #eee; padding: 12px 0; }
        .product-image { width: 72px; height: 72px; object-fit: cover; border-radius: 6px; border: 1px solid #e9ecef; }
        .product-details { flex: 1; }
        .product-price { text-align: right; min-width: 80px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div style="text-align: center;">
            <img src="cid:logo@modfy" alt="MODFY" style="height: 50px; display: inline-block;" />
          </div>
        </div>
        <div class="content">
          <h2>Order Update - ${orderNumber}</h2>
          <p>Hi ${customerName || 'Customer'},</p>
          <p>Your order <strong>${orderNumber}</strong> has been <span class="status">${newStatus.toUpperCase()}</span>.</p>

          ${items.length > 0 ? `
            <h3 style="margin-top:20px;">Items in this order</h3>
            ${items.map(item => `
              <div class="order-item">
                <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}" alt="${item.productName}" class="product-image" />
                <div class="product-details">
                  <strong>${item.productName}</strong><br />
                  <small>Qty: ${item.quantity}</small>
                </div>
                <div class="product-price">
                  <strong>LKR ${ (parseFloat(item.price || '0') * item.quantity).toFixed(2) }</strong><br />
                  <small>LKR ${item.price} each</small>
                </div>
              </div>
            `).join('')}
          ` : ''}

          <p style="margin-top:20px;">If you have any questions, reply to this email or contact our support team.</p>
          <p style="margin-top:20px;">Best regards,<br/>The MODFY Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: {
        name: 'MODFY - Orders',
        address: process.env.SMTP_USER || 'info@modfy.lk'
      },
      to,
      subject: `Your Order ${orderNumber} has been ${newStatus}`,
      html: statusEmailHTML,
      text: `Your order ${orderNumber} status is now ${newStatus}. ${message}`,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'storage', 'logo', 'logo.png'),
          cid: 'logo@modfy'
        }
      ]
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`Order status update email sent successfully to ${to} for order ${orderNumber}`);
    return true;
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    return false;
  }
}