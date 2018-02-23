import './assets/css/app.css';

import ModelBase from './assets/js/models/ModelBase.js';
import SimpleVirtualModel from './assets/js/models/SimpleVirtualModel.js';
import PassiveVirtualModel from './assets/js/models/PassiveVirtualModel.js';
import QTreeModel from './assets/js/models/QTreeModel.js';
import IVGrid from './assets/js/VGrid.js';
import CellProvider from './assets/js/CellProvider.js';

const VGrid = {
	VGrid: IVGrid,
	ModelBase,
	SimpleVirtualModel,
	PassiveVirtualModel,
	QTreeModel,
	CellProvider
}

window.VGrid = VGrid;

export default VGrid;
