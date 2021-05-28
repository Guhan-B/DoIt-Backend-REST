import express from 'express';
import { body } from 'express-validator';

import { me } from '../controllers/user';

const router = express.Router();

router.get(
    '/me',
    me
);

export default router;