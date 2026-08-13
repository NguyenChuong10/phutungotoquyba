import { Router } from 'express';
import { createBrand, updateBrand, deleteBrand } from '../controllers/brandController';
import { verifyAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyAdmin);

router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

export default router;
