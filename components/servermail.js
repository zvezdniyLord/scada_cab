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

//v3
/*const express = require('express');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());

// Email configuration
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

// Create reusable transporter
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

// Create IMAP connection with connection pooling
const createImapConnection = () => {
  const imap = new Imap({
    user: EMAIL_CONFIG.user,
    password: EMAIL_CONFIG.password,
    host: EMAIL_CONFIG.imap.host,
    port: EMAIL_CONFIG.imap.port,
    tls: EMAIL_CONFIG.imap.tls,
    tlsOptions: { rejectUnauthorized: false },
    keepalive: {
      interval: 10000,
      idleTimeout: 300000
    },
    debug: console.log
  });

  return imap;
};

// Get emails endpoint with improved error handling and connection management
app.get('/api/get-emails', (req, res) => {
  const imap = createImapConnection();
  let isConnectionClosed = false;

  const closeConnection = () => {
    if (!isConnectionClosed) {
      isConnectionClosed = true;
      try {
        imap.end();
      } catch (err) {
        console.error('Error closing IMAP connection:', err);
      }
    }
  };

  // Set timeout for the entire operation
  const timeout = setTimeout(() => {
    closeConnection();
    res.status(504).json({ success: false, message: 'Request timeout' });
  }, 30000);

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        clearTimeout(timeout);
        closeConnection();
        return res.status(500).json({ success: false, message: 'Failed to open mailbox' });
      }

      try {
        const searchCriteria = ['ALL'];
        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true
        };

        imap.search(searchCriteria, (err, results) => {
          if (err) {
            clearTimeout(timeout);
            closeConnection();
            return res.status(500).json({ success: false, message: 'Search failed' });
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

          f.once('error', (err) => {
            clearTimeout(timeout);
            closeConnection();
            res.status(500).json({ success: false, message: 'Fetch failed' });
          });

          f.once('end', () => {
            clearTimeout(timeout);
            closeConnection();
            res.json({
              success: true,
              emails: messages.map(msg => ({
                from: msg.headers.from?.[0] || 'Unknown',
                subject: msg.headers.subject?.[0] || 'No Subject',
                date: msg.headers.date?.[0] || new Date().toISOString(),
                body: msg.text || 'No Content'
              }))
            });
          });
        });
      } catch (error) {
        clearTimeout(timeout);
        closeConnection();
        res.status(500).json({ success: false, message: 'Failed to process emails' });
      }
    });
  });

  imap.once('error', (err) => {
    clearTimeout(timeout);
    closeConnection();
    res.status(500).json({ success: false, message: 'IMAP connection failed' });
  });

  imap.connect();
});

// Send email endpoint with improved error handling
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const mailOptions = {
      from: {
        name: 'scadaint_support',
        address: EMAIL_CONFIG.user
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
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/

const express = require('express');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const cors = require('cors');
const bodyParser = require('body-parser');

let Imap = require("node-imap");
let inspect = require("util").inspect;
const app = express();

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.json());

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

// Email configuration
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


const imapConfig = {
  user: "4neroq4@gmail.com",
  password: "itjh xhjv moux iksi",
  host: "imap.gmail.com",
  port: 993,
  tls: true
}

app.get('/api/get-emails', (req, res) => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
          if (err) {
              console.error('Ошибка при открытии почтового ящика:', err);
              return res.status(500).json({ success: false, message: 'Ошибка при получении писем' });
          }

          // Поиск всех писем
          imap.search(['ALL'], (err, results) => {
              if (err) {
                  console.error('Ошибка при поиске писем:', err);
                  return res.status(500).json({ success: false, message: 'Ошибка при поиске писем' });
              }

              if (results.length === 0) {
                  return res.json({ success: true, emails: [] });
              }

              // Ограничиваем до последних 10 сообщений
              const fetch = imap.fetch(results.slice(-10), { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'] });
              const messages = [];

              fetch.on('message', (msg) => {
                  msg.on('body', (stream, info) => {
                      simpleParser(stream, (err, parsed) => {
                          if (!err) {
                              messages.push({
                                  from: parsed.from ? parsed.from.text : 'Неизвестный отправитель',
                                  subject: parsed.subject || 'Без темы',
                                  date: parsed.date || new Date().toISOString(),
                                  body: parsed.text || 'Нет содержимого'
                              });
                          }
                      });
                  });
              });

              fetch.once('end', () => {
                  console.log('Полученные сообщения:', messages);
                  imap.end();
                  return res.json({
                      success: true,
                      emails: messages
                  });
              });
          });
      });
  });

  imap.once('error', (err) => {
      console.error('Ошибка IMAP соединения:', err);
      return res.status(500).json({ success: false, message: 'Ошибка IMAP соединения' });
  });

  imap.connect();
});

// Send email endpoint with improved error handling
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const mailOptions = {
      from: {
        name: 'scadaint_support',
        address: EMAIL_CONFIG.user
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
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
