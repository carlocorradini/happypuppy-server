import { Router } from 'express';
import swaggerUI from 'swagger-ui-express';
import { DocsUtil } from '../../../utils';

const router = Router();

router.use('', swaggerUI.serve, swaggerUI.setup(DocsUtil.load(DocsUtil.API_VERSION.V1)));

export default router;
