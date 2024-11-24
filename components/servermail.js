/*const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Конфигурация для Yandex SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true, // Для порта 465 используем SSL/TLS
  auth: {
    user: 'aadavidenkoweb',
    pass: 'dbccigpfpdietirz'
  },
  tls: {
    rejectUnauthorized: false // Только для разработки
  }
});

// Проверка соединения при запуске сервера
transporter.verify((error, success) => {
  if (error) {
    console.error('Ошибка при проверке SMTP соединения:', error);
  } else {
    console.log('Сервер готов к отправке сообщений');
  }
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const mailOptions = {
      from: {
        name: 'Your Name', // Замените на ваше имя
        address: 'aadavidenkoweb@yandex.ru'
      },
      to: to,
      subject: subject,
      text: body,
      headers: {
        'X-Priority': '3', // Нормальный приоритет
        'X-MSMail-Priority': 'Normal'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.json({
      success: true,
      message: 'Email успешно отправлен',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке email',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/


//v2
/*const express = require('express');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Конфигурация для Yandex SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true, // Для порта 465 используем SSL/TLS
    auth: {
      user: 'aadavidenkoweb',
      pass: 'dbccigpfpdietirz'
    },
  tls: {
    rejectUnauthorized: false
  }
});

// Конфигурация IMAP для Yandex
const imapConfig = {
  user: 'aadavidenkoweb',
  password: 'dbccigpfpdietirz',
  host: 'imap.yandex.ru',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// Получение писем
app.get('/api/get-emails', (req, res) => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    imap.openBox('INBOX', false, async (err, box) => {
      if (err) {
        console.error('Ошибка при открытии почтового ящика:', err);
        res.status(500).json({ success: false, message: 'Ошибка при получении писем' });
        return;
      }

      try {
        // Поиск последних 10 писем
        const searchCriteria = ['ALL'];
        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true
        };

        imap.search(searchCriteria, (err, results) => {
          if (err) {
            console.error('Ошибка при поиске писем:', err);
            res.status(500).json({ success: false, message: 'Ошибка при поиске писем' });
            return;
          }

          // Получаем последние 10 писем
          const messages = [];
          const f = imap.fetch(results.slice(-10), fetchOptions);

          f.on('message', (msg) => {
            const email = {};

            msg.on('body', (stream, info) => {
              if (info.which === 'TEXT') {
                simpleParser(stream, (err, parsed) => {
                  if (!err) {
                    email.text = parsed.text;
                  }
                });
              } else {
                let buffer = '';
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });
                stream.once('end', () => {
                  email.headers = Imap.parseHeader(buffer);
                });
              }
            });

            msg.once('end', () => {
              messages.push(email);
            });
          });

          f.once('error', (err) => {
            console.error('Ошибка при получении писем:', err);
          });

          f.once('end', () => {
            imap.end();
            res.json({
              success: true,
              emails: messages.map(msg => ({
                from: msg.headers.from?.[0] || 'Unknown',
                subject: msg.headers.subject?.[0] || 'No Subject',
                date: msg.headers.date?.[0] || 'No Date',
                body: msg.text || 'No Content'
              }))
            });
          });
        });
      } catch (error) {
        console.error('Ошибка при обработке писем:', error);
        res.status(500).json({ success: false, message: 'Ошибка при обработке писем' });
      }
    });
  });

  imap.once('error', (err) => {
    console.error('Ошибка IMAP соединения:', err);
    res.status(500).json({ success: false, message: 'Ошибка IMAP соединения' });
  });

  imap.connect();
});

// Отправка email
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const mailOptions = {
      from: {
        name: 'scadaint',
        address: 'aadavidenkoweb@yandex.ru'
      },
      to: to,
      subject: subject,
      text: body,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    res.json({
      success: true,
      message: 'Email успешно отправлен',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при отправке email',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/

const express = require('express');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const EMAIL_CONFIG = {
  user: 'aadavidenkoweb@yandex.ru',
  password: 'dbccigpfpdietirz',
  smtp: {
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true
  },
  imap: {
    host: 'imap.yandex.ru',
    port: 993,
    tls: true
  }
};

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.smtp.host,
  port: EMAIL_CONFIG.smtp.port,
  secure: EMAIL_CONFIG.smtp.secure,
  auth: {
    user: EMAIL_CONFIG.user,
    pass: EMAIL_CONFIG.password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Create IMAP client with proper error handling
const createImapClient = () => {
  const imap = new Imap({
    user: EMAIL_CONFIG.user,
    password: EMAIL_CONFIG.password,
    host: EMAIL_CONFIG.imap.host,
    port: EMAIL_CONFIG.imap.port,
    tls: EMAIL_CONFIG.imap.tls,
    tlsOptions: { rejectUnauthorized: false },
    keepalive: true
  });

  return imap;
};

// Function to check IMAP connection
const checkImapConnection = () => {
  return new Promise((resolve, reject) => {
    const imap = createImapClient();
    const timeout = setTimeout(() => {
      imap.end();
      reject(new Error('IMAP connection timeout'));
    }, 10000);

    imap.once('ready', () => {
      clearTimeout(timeout);
      imap.end();
      resolve(true);
    });

    imap.once('error', (err) => {
      clearTimeout(timeout);
      imap.end();
      reject(err);
    });

    imap.connect();
  });
};

// Function to print server status
const printServerStatus = (smtpStatus, imapStatus) => {
  console.log('\n=== Email Server Status ===');
  console.log('┌────────────────────────────────────┐');
  console.log(`│ SMTP Status: ${smtpStatus.success ? '✓ Ready' : '✗ Error'}${' '.repeat(27 - (smtpStatus.success ? 7 : 7))}│`);
  if (!smtpStatus.success) {
    console.log(`│ SMTP Error: ${smtpStatus.error}${' '.repeat(29 - smtpStatus.error.length)}│`);
  }
  console.log(`│ IMAP Status: ${imapStatus.success ? '✓ Ready' : '✗ Error'}${' '.repeat(27 - (imapStatus.success ? 7 : 7))}│`);
  if (!imapStatus.success) {
    console.log(`│ IMAP Error: ${imapStatus.error}${' '.repeat(29 - imapStatus.error.length)}│`);
  }
  console.log('└────────────────────────────────────┘');
};

// Rest of the routes remain the same
app.get('/api/get-emails', (req, res) => {
  const imap = createImapClient();
  let fetchTimeout;

  const cleanup = () => {
    clearTimeout(fetchTimeout);
    if (imap.state !== 'disconnected') {
      imap.end();
    }
  };

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        cleanup();
        console.error('Error opening mailbox:', err);
        return res.status(500).json({ success: false, message: 'Failed to open mailbox', error: err.message });
      }

      try {
        const searchCriteria = ['ALL'];
        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true,
          markSeen: false
        };

        fetchTimeout = setTimeout(() => {
          cleanup();
          res.status(504).json({ success: false, message: 'Fetch operation timed out' });
        }, 30000);

        imap.search(searchCriteria, (searchErr, results) => {
          if (searchErr) {
            cleanup();
            return res.status(500).json({ success: false, message: 'Search failed', error: searchErr.message });
          }

          if (!results.length) {
            cleanup();
            return res.json({ success: true, emails: [] });
          }

          const messages = [];
          const f = imap.fetch(results.slice(-10), fetchOptions);

          f.on('message', (msg) => {
            const email = {};

            msg.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', () => {
                if (info.which === 'TEXT') {
                  email.text = buffer;
                } else {
                  email.headers = Imap.parseHeader(buffer);
                }
              });
            });

            msg.once('end', () => {
              messages.push(email);
            });
          });

          f.once('error', (fetchErr) => {
            cleanup();
            console.error('Fetch error:', fetchErr);
            res.status(500).json({ success: false, message: 'Fetch failed', error: fetchErr.message });
          });

          f.once('end', () => {
            cleanup();
            res.json({
              success: true,
              emails: messages.map(msg => ({
                from: msg.headers.from?.[0] || 'Unknown',
                to: msg.headers.to?.[0] || 'Unknown',
                subject: msg.headers.subject?.[0] || 'No Subject',
                date: msg.headers.date?.[0] || new Date().toISOString(),
                body: msg.text || 'No Content'
              }))
            });
          });
        });
      } catch (error) {
        cleanup();
        console.error('Error processing emails:', error);
        res.status(500).json({ success: false, message: 'Failed to process emails', error: error.message });
      }
    });
  });

  imap.once('error', (err) => {
    cleanup();
    console.error('IMAP connection error:', err);
    res.status(500).json({ success: false, message: 'IMAP connection failed', error: err.message });
  });

  imap.once('end', () => {
    console.log('IMAP connection ended');
  });

  imap.connect();
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, html } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: {
          to: !to,
          subject: !subject,
          body: !body
        }
      });
    }

    const mailOptions = {
      from: {
        name: 'SCADA International',
        address: EMAIL_CONFIG.user
      },
      to,
      subject,
      text: body,
      html: html || body,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent:', info.messageId);
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      details: {
        accepted: info.accepted,
        rejected: info.rejected
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
      details: error.response || {}
    });
  }
});

app.get('/api/folders', (req, res) => {
  const imap = createImapClient();
  let folderTimeout;

  const cleanup = () => {
    clearTimeout(folderTimeout);
    if (imap.state !== 'disconnected') {
      imap.end();
    }
  };

  folderTimeout = setTimeout(() => {
    cleanup();
    res.status(504).json({ success: false, message: 'Folder listing timed out' });
  }, 10000);

  imap.once('ready', () => {
    imap.getBoxes((err, boxes) => {
      cleanup();
      if (err) {
        console.error('Error getting folders:', err);
        return res.status(500).json({ success: false, message: 'Failed to get folders', error: err.message });
      }

      const folders = Object.keys(boxes).map(name => ({
        name,
        children: boxes[name].children ? Object.keys(boxes[name].children) : []
      }));

      res.json({ success: true, folders });
    });
  });

  imap.once('error', (err) => {
    cleanup();
    console.error('IMAP connection error:', err);
    res.status(500).json({ success: false, message: 'IMAP connection failed', error: err.message });
  });

  imap.connect();
});

// Server startup with status checks
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`\nServer running on port ${PORT}`);

  // Check SMTP and IMAP connections
  let smtpStatus = { success: false, error: 'Not checked' };
  let imapStatus = { success: false, error: 'Not checked' };

  try {
    await transporter.verify();
    smtpStatus = { success: true };
  } catch (error) {
    smtpStatus = { success: false, error: error.message.slice(0, 25) };
  }

  try {
    await checkImapConnection();
    imapStatus = { success: true };
  } catch (error) {
    imapStatus = { success: false, error: error.message.slice(0, 25) };
  }

  printServerStatus(smtpStatus, imapStatus);
});
