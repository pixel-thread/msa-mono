import corsLib from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'https://msa-mono.onrender.com',
  'https://msa-web.onrender.com',
];

export const cors = corsLib({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'x-trace-id',
    'x-association-slug',
    'x-device-type',
  ],

  exposedHeaders: ['x-trace-id'],

  maxAge: 86400,
});
