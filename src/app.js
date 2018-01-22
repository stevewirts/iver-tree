import './assets/scss/app.scss';

import ModelBase from './assets/js/models/ModelBase.js';
import SimpleVirtualModel from './assets/js/models/SimpleVirtualModel.js';
import PassiveVirtualModel from './assets/js/models/PassiveVirtualModel.js';
import VGrid from './assets/js/VGrid.js';

window.VGrid = {
	VGrid,
	ModelBase,
	SimpleVirtualModel,
	PassiveVirtualModel
}

export default window.VGrid;
