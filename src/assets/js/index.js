import '../css/main.css';

import ModelBase from './models/ModelBase.js';
import SimpleVirtualModel from './models/SimpleVirtualModel.js';
import PassiveVirtualModel from './models/PassiveVirtualModel.js';
import FakeDataModel from './models/FakeDataModel.js';
import VGrid from './VGrid.js';

window.VGrid = {
	VGrid,
	ModelBase,
	SimpleVirtualModel,
	PassiveVirtualModel,
	FakeDataModel
}

export default window.VGrid;

