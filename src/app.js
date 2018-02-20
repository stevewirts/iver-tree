import './assets/scss/app.scss';

import ModelBase from './assets/js/models/ModelBase.js';
import SimpleVirtualModel from './assets/js/models/SimpleVirtualModel.js';
import PassiveVirtualModel from './assets/js/models/PassiveVirtualModel.js';
import QTreeModel from './assets/js/models/QTreeModel.js';
import IVGrid from './assets/js/VGrid.js';

const VGrid = {
	VGrid: IVGrid,
	ModelBase,
	SimpleVirtualModel,
	PassiveVirtualModel,
	QTreeModel
}

window.VGrid = VGrid;

export default VGrid;
