import { Router } from 'express';
import { carteiraHandler } from '../controllers/WalletController';
import { tokenUtils } from "../utils/TokenUtils";
import {commonUserUtils} from "../utils/commonUserUtils";

const route: Router = Router();

route.post('/addFunds/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, carteiraHandler.addFunds);
route.post('/withdrawFunds/:id', tokenUtils.checkToken, commonUserUtils.checkCommonUser, carteiraHandler.withdrawFunds);
route.get('/getAllWalletInformation/:id', tokenUtils.checkToken, carteiraHandler.getAllWalletInformation);

export default route;