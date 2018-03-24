// Control the button statuses
var autoButtons = {
	autoBuild: {
		active: false,
		swapName: 'build',
		buttonId: 'autoBuild'
	},
	autoCraft: {
		active: false,
		swapName: 'craft',
		buttonId: 'autoCraft'
	},
	autoHunt: {
		active: false,
		swapName: 'hunt',
		buttonId: 'autoHunt'
	},
	autoTrade: {
		active: false,
		swapName: 'trade',
		buttonId: 'autoTrade'
	},
	autoPraise: {
		active: false,
		swapName: 'praise',
		buttonId: 'autoPraise'
	},
	autoScience: {
		active: false,
		swapName: 'science',
		buttonId: 'autoScience'
	},
	autoUpgrade: {
		active: false,
		swapName: 'upgrade',
		buttonId: 'autoUpgrade'
	},
	autoParty: {
		active: false,
		swapName: 'party',
		buttonId: 'autoParty'
	},
	autoAssign: {
		active: false,
		swapName: 'assign',
		buttonId: 'autoAssign'
	},
	autoEnergy: {
		active: false,
		swapName: 'energy',
		buttonId: 'autoEnergy'
	},
	alwaysOn: {
		active: true
	},
};

// Controls which trades are performed in maximize mode
var tradeMax = {uranium: false, coal: false, iron: false};

// Controls which job free kittens are assigned to
var autoChoice = 'farmer';

// Controls whether autoSpace() will launch new space programs
var programBuild = false;


// Caches the objects representing various game elements for faster access
var resources = {};
{
	const resourceNames = [
		'alloy',
		'beam',
		'blueprint',
		'catnip',
		'coal',
		'compedium',
		'concrate',
		'culture',
		'eludium',
		'furs',
		'gear',
		'gold',
		'iron',
		'kerosene',
		'kittens',
		'manpower',
		'manuscript',
		'megalith',
		'minerals',
		'oil',
		'parchment',
		'plate',
		'scaffold',
		'science',
		'ship',
		'slab',
		'starchart',
		'steel',
		'tanker',
		'thorium',
		'titanium',
		'unobtainium',
		'uranium',
		'wood',
	];
	const numResources = resourceNames.length;
	for (let i = 0; i < numResources; i++) {
		const resourceName = resourceNames[i];
		resources[resourceName] = gamePage.resPool.get(resourceName);
	}
}

var crafts = {};
{
	const craftNames = [
		'alloy',
		'beam',
		'blueprint',
		'compedium',
		'concrate',
		'eludium',
		'gear',
		'kerosene',
		'manuscript',
		'megalith',
		'parchment',
		'plate',
		'scaffold',
		'ship',
		'slab',
		'steel',
		'tanker',
		'thorium',
		'wood',
	];
	const numCrafts = craftNames.length;
	for (let i = 0; i < numCrafts; i++) {
		const craftName = craftNames[i];
		crafts[craftName] = gamePage.workshop.getCraft(craftName);
	}
}

var races = {};
{
	const raceNames = [
		'dragons',
		'griffins',
		'leviathans',
		'sharks',
		'spiders',
		'zebras',
	];
	const numRaces = raceNames.length;
	for (let i = 0; i < numRaces; i++) {
		const raceName = raceNames[i];
		races[raceName] = gamePage.diplomacy.get(raceName);
	}
}


// Controls what level of fur derivatives is autocrafted
// Note: If you change the default value of this variable, you need to update which element of the craftFur dropdown is initially selected to match!
var furDerVal = 4;

// Controls how much of your production of each resource should be used for crafting other resources for non-fur-derivative crafts
var craftPortion = 20;

// Controls how much of your production of each resource should be used for crafting other resources for fur-derivative crafts
var furDerivativeCraftPortion = 50;

// Controls how much of a stockpile-limited resource's per-tick income can be used for crafting when it's not at its stockpile limit
var craftIncome = 50;

// Controls whether autoCraft() will craft extra thorium to prevent a shortfall
var craftThoriumShortfall = false;


// Defines the various crafts possible
var craftings = [
	{
		name: 'wood',
		ingredients: [
			// The amount of catnip required to craft wood is variable based on what techs you've researched, so it gets set dynamically during crafting
			{name: 'catnip'},
		],
	},
	{
		name: 'beam',
		ingredients: [
			{name: 'wood', amount: '175'},
		],
	},
	{
		name: 'slab',
		ingredients: [
			{name: 'minerals', amount: '250'},
		],
	},
	{
		name: 'steel',
		ingredients: [
			{name: 'iron', amount: '100'},
			{name: 'coal', amount: '100'},
		],
	},
	{
		name: 'plate',
		ingredients: [
			{name: 'iron', amount: '125'},
		],
	},
	{
		name: 'kerosene',
		ingredients: [
			{name: 'oil', amount: '7500'},
		],
	},
	{
		name: 'thorium',
		ingredients: [
			{name: 'uranium', amount: '250'},
		],
	},
	{
		name: 'eludium',
		ingredients: [
			{name: 'unobtainium', amount: '1000'},
		],
	},
	{
		name: 'scaffold',
		ingredients: [
			{name: 'beam', amount: '50'},
		],
	},
	{
		name: 'alloy',
		ingredients: [
			{name: 'steel', amount: '75'},
			{name: 'titanium', amount: '10'},
		],
	},
	{
		name: 'gear',
		ingredients: [
			{name: 'steel', amount: '15'},
		],
	},
	{
		name: 'concrate',
		ingredients: [
			{name: 'slab', amount: '2500'},
			{name: 'steel', amount: '25'},
		],
	},
	{
		name: 'ship',
		ingredients: [
			{name: 'scaffold', amount: '100'},
			{name: 'plate', amount: '150'},
			// The number of starcharts required to craft ships is variable based on what techs you've researched and how many satellites you have, so it gets set dynamically during crafting
			{name: 'starchart'},
		],
	},
	{
		name: 'tanker',
		ingredients: [
			{name: 'ship', amount: '200'},
			{name: 'alloy', amount: '1250'},
			{name: 'blueprint', amount: '5'},
		],
	},
	{
		name: 'megalith',
		ingredients: [
			{name: 'slab', amount: '50'},
			{name: 'beam', amount: '25'},
			{name: 'plate', amount: '5'},
		],
	},
];
var numCraftings = craftings.length;

var furDerivativeCraftings = {
	'parchment' : {
		name: 'parchment',
		ingredients: [
			{name: 'furs', amount: '175'},
		],
	},
	'manuscript' : {
		name: 'manuscript',
		ingredients: [
			{name: 'culture', amount: '400'},
			{name: 'parchment', amount: '25'},
		],
	},
	'compedium' : {
		name: 'compedium',
		ingredients: [
			{name: 'science', amount: '10000'},
			{name: 'manuscript', amount: '50'},
		],
	},
	'blueprint' : {
		name: 'blueprint',
		ingredients: [
			{name: 'science', amount: '25000'},
			{name: 'compedium', amount: '25'},
		],
	},
};


// Controls which building to build
var buildings = [
	['Hut', false],
	['Log House', false],
	['Mansion', false],
	['Workshop', false],
	['Factory', false],
	['Catnip field', false],
	['Pasture', false],
	['Mine', false],
	['Lumber Mill', false],
	['Aqueduct', false],
	['Oil Well', false],
	['Quarry', false],
	['Smelter', false],
	['Bio Lab', false],
	['Calciner', false],
	['Reactor', false],
	['Accelerator', false],
	['Steamworks', false],
	['Magneto', false],
	['Library', false],
	['Academy', false],
	['Observatory', false],
	['Barn', false],
	['Harbour', false],
	['Warehouse', false],
	['Amphitheatre', false],
	['Tradepost', false],
	['Chapel', false],
	['Temple', false],
	['Mint', false],
	['Ziggurat', false],
	['Unicorn Pasture', false],
	['Space Elevator', false, 0],
	['Satellite', false, 0],
	['Space Station', false, 0],
	['Moon Outpost', false, 1],
	['Moon Base', false, 1],
	['Planet Cracker', false, 2],
	['Hydro Fracturer', false, 2],
	['Spice Refinery', false, 2],
	['Research Vessel', false, 3],
	['Orbital Array', false, 3],
	['Sunlifter', false, 4],
	['Containment Chamber', false, 4],
	['Cryostation', false, 5],
	['Space Beacon', false, 6],
	['Terraforming Station', false, 7],
	['Hydroponics', false, 7],
	['Tectonic', false, 8]
];
var numBuildings = buildings.length;

var buildingsList = [
	['hut'],
	['logHouse'],
	['mansion'],
	['workshop'],
	['factory'],
	['field'],
	['pasture'],
	['mine'],
	['lumberMill'],
	['aqueduct'],
	['oilWell'],
	['quarry'],
	['smelter'],
	['biolab'],
	['calciner'],
	['reactor'],
	['accelerator'],
	['steamworks'],
	['magneto'],
	['library'],
	['academy'],
	['observatory'],
	['barn'],
	['harbor'],
	['warehouse'],
	['amphitheatre'],
	['tradepost'],
	['chapel'],
	['temple'],
	['mint'],
	['ziggurat'],
	['unicornPasture'],
	['spaceElevator'],
	['sattelite'],
	['spaceStation'],
	['moonOutpost'],
	['moonBase'],
	['planetCracker'],
	['hydrofracturer'],
	['spiceRefinery'],
	['researchVessel'],
	['orbitalArray'],
	['sunlifter'],
	['containmentChamber'],
	['cryostation'],
	['spaceBeacon'],
	['terraformingStation'],
	['hydroponics'],
	['tectonic']
];


// Create the HTML
// Putting this in a block so it can be folded away when editing other parts of the code
{
	const htmlMenuAddition = '<div id="farRightColumn" class="column">' +

	'<a id="scriptOptions" onclick="selectOptions()"> | ScriptKitties </a>' +

	'<div id="optionSelect" style="display:none; margin-top:-600px; margin-left:-100px; width:200px" class="dialog help">' +
	'<a href="#" onclick="clearOptionHelpDiv();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

	'<button id="killSwitch" onclick="clearInterval(clearScript()); gamePage.msg(\'Script is dead\');">Kill Switch</button> <br />' +
	'<button id="efficiencyButton" onclick="kittenEfficiency()">Check Efficiency</button><br /><br />' +

	'<button id="autoBuild" style="color:red" onclick="autoSwitch(autoButtons.autoBuild);"> Auto Build </button><br />' +
	'<button id="bldSelect" onclick="selectBuildings()">Select Building</button><br />' +

	'<button id="autoAssign" style="color:red" onclick="autoSwitch(autoButtons.autoAssign)"> Auto Assign </button>' +
	'<select id="autoAssignChoice" size="1" onclick="setAutoAssignValue()">' +
	'<option value="farmer" selected="selected">Farmer</option>' +
	'<option value="woodcutter">Woodcutter</option>' +
	'<option value="scholar">Scholar</option>' +
	'<option value="priest">Priest</option>' +
	'<option value="miner">Miner</option>' +
	'<option value="hunter">Hunter</option>' +
	'<option value="engineer">Engineer</option>' +
	'</select><br />' +

	'<button id="autoCraft" style="color:red" onclick="autoSwitch(autoButtons.autoCraft)"> Auto Craft </button>' +
	'<select id="craftFur" size="1" onclick="setFurValue()">' +
	'<option value="0">None</option>' +
	'<option value="1">Parchment</option>' +
	'<option value="2">Manuscript</option>' +
	'<option value="3">Compendium</option>' +
	'<option value="4" selected="selected">Blueprint</option>' +
	'</select><br />' +
	'<label id="craftPortionLabel"> Craft % </label><span id="craftPortionSpan" title="Between 0 and 100"><input id="craftPortionText" type="text" style="width:25px" onchange="craftPortion = this.value" value="' + craftPortion + '"></span><br />' +
	'<label id="furDerivativeCraftPortionLabel"> Fur Craft % </label><span id="furDerivativeCraftPortionSpan" title="Between 0 and 100"><input id="furDerivativeCraftPortionText" type="text" style="width:25px" onchange="furDerivativeCraftPortion = this.value" value="' + furDerivativeCraftPortion + '"></span><br />' +
	'<label id="craftIncomeLabel"> Income Diversion % </label><span id="craftIncomeSpan" title="Between 0 and 100"><input id="craftIncomeText" type="text" style="width:25px" onchange="craftIncome = this.value" value="' + craftIncome + '"></span><br />' +
	'<input id= "craftThoriumShortfall" type="checkbox" onclick="craftThoriumShortfall = this.checked" /><label for="craftThoriumShortfall">Prevent thorium shortages</label><br /><br />' +

	'<button id="autoHunt" style="color:red" onclick="autoSwitch(autoButtons.autoHunt)"> Auto Hunt </button><br />' +
	'<button id="autoTrade" style="color:red" onclick="autoSwitch(autoButtons.autoTrade)"> Auto Trade </button><br />' +
	'<input id= "tradeMaxUranium" type="checkbox" onclick="tradeMax.uranium = this.checked" /><label for="tradeMaxUranium">Maximize uranium trades</label><br />' +
	'<input id= "tradeMaxCoal" type="checkbox" onclick="tradeMax.coal = this.checked" /><label for="tradeMaxCoal">Maximize coal trades</label><br />' +
	'<input id= "tradeMaxIron" type="checkbox" onclick="tradeMax.iron = this.checked" /><label for="tradeMaxIron">Maximize iron trades</label><br />' +
	'<button id="autoPraise" style="color:red" onclick="autoSwitch(autoButtons.autoPraise)"> Auto Praise </button><br /><br />' +

	'<button id="autoScience" style="color:red" onclick="autoSwitch(autoButtons.autoScience)"> Auto Science </button><br />' +
	'<button id="autoUpgrade" style="color:red" onclick="autoSwitch(autoButtons.autoUpgrade)"> Auto Upgrade </button><br />' +
	'<button id="autoEnergy" style="color:red" onclick="autoSwitch(autoButtons.autoEnergy)"> Energy Control </button><br />' +
	'<button id="autoParty" style="color:red" onclick="autoSwitch(autoButtons.autoParty)"> Auto Party </button>' +
	'</div>' +
	'</div>';


	const bldSelectAddition = '<div id="buildingSelect" style="display:none; margin-top:-500px; width:200px" class="dialog help">' +
	'<a href="#" onclick="$(\'#spaceSelect\').toggle(); $(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; left: 15px;">space</a>' +
	'<a href="#" onclick="$(\'#buildingSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

	'	<br /><input type="checkbox" id="hutChecker"><label for="hutChecker" onclick="$(\'.hutCheck\').click();"><b>Kitten Housing</b></label><br />' +
	'	<input type="checkbox" id="hutBld" class="hutCheck" onchange="verifyBuildingSelected(\'0\', \'hutBld\');"><label for="hutBld">Hut</label><br />' +
	'	<input type="checkbox" id="houseBld" class="hutCheck" onchange="verifyBuildingSelected(\'1\', \'houseBld\')"><label for="houseBld">Log House</label><br />' +
	'	<input type="checkbox" id="mansionBld" class="hutCheck" onchange="verifyBuildingSelected(\'2\', \'mansionBld\')"><label for="mansionBld">Mansion</label><br /><br />' +

	'	<input type="checkbox" id="craftChecker"><label for="craftChecker" onclick="$(\'.craftCheck\').click();"><b>Craft Bonuses</b></label><br />' +
	'	<input type="checkbox" id="workshopBld" class="craftCheck" onchange="verifyBuildingSelected(\'3\', \'workshopBld\')"><label for="workshopBld">Workshop</label><br />' +
	'	<input type="checkbox" id="factoryBld" class="craftCheck" onchange="verifyBuildingSelected(\'4\', \'factoryBld\')"><label for="factoryBld">Factory</label><br /><br />' +

	'	<input type="checkbox" id="prodChecker"><label for="prodChecker" onclick="$(\'.prodCheck\').click();"><b>Production</b></label><br />' +
	'	<input type="checkbox" id="fieldBld" class="prodCheck" onchange="verifyBuildingSelected(\'5\', \'fieldBld\')"><label for="fieldBld">Catnip Field</label><br />' +
	'	<input type="checkbox" id="pastureBld" class="prodCheck" onchange="verifyBuildingSelected(\'6\', \'pastureBld\')"><label for="pastureBld">Pasture/Solar</label><br />' +
	'	<input type="checkbox" id="mineBld" class="prodCheck" onchange="verifyBuildingSelected(\'7\', \'mineBld\')"><label for="mineBld">Mine</label><br />' +
	'	<input type="checkbox" id="lumberBld" class="prodCheck" onchange="verifyBuildingSelected(\'8\', \'lumberBld\')"><label for="lumberBld">Lumber Mill</label><br />' +
	'	<input type="checkbox" id="aqueductBld" class="prodCheck" onchange="verifyBuildingSelected(\'9\', \'aqueductBld\')"><label for="aqueductBld">Aqueduct/Hydro</label><br />' +
	'	<input type="checkbox" id="oilBld" class="prodCheck" onchange="verifyBuildingSelected(\'10\', \'oilBld\')"><label for="oilBld">Oil Well</label><br />' +
	'	<input type="checkbox" id="quarryBld" class="prodCheck" onchange="verifyBuildingSelected(\'11\', \'quarryBld\')"><label for="quarryBld">Quarry</label><br /><br />' +

	'	<input type="checkbox" id="conversionChecker"><label for="conversionChecker" onclick="$(\'.convertCheck\').click();"><b>Conversion</b></label><br />' +
	'	<input type="checkbox" id="smelterBld" class="convertCheck" onchange="verifyBuildingSelected(\'12\', \'smelterBld\')"><label for="smelterBld">Smelter</label><br />' +
	'	<input type="checkbox" id="labBld" class="convertCheck" onchange="verifyBuildingSelected(\'13\', \'labBld\')"><label for="labBld">Bio Lab</label><br />' +
	'	<input type="checkbox" id="calcinerBld" class="convertCheck" onchange="verifyBuildingSelected(\'14\', \'calcinerBld\')"><label for="calcinerBld">Calciner</label><br />' +
	'	<input type="checkbox" id="reactorBld" class="convertCheck" onchange="verifyBuildingSelected(\'15\', \'reactorBld\')"><label for="reactorBld">Reactor</label><br />' +
	'	<input type="checkbox" id="acceleratorBld" class="convertCheck" onchange="verifyBuildingSelected(\'16\', \'acceleratorBld\')"><label for="acceleratorBld">Accelerator</label><br />' +
	'	<input type="checkbox" id="steamBld" class="convertCheck" onchange="verifyBuildingSelected(\'17\', \'steamBld\')"><label for="steamBld">Steamworks</label><br />' +
	'	<input type="checkbox" id="magnetoBld" class="convertCheck" onchange="verifyBuildingSelected(\'18\', \'magnetoBld\')"><label for="magnetoBld">Magneto</label><br /><br />' +

	'	<input type="checkbox" id="scienceChecker"><label for="scienceChecker" onclick="$(\'.scienceCheck\').click();"><b>Science</b></label><br />' +
	'	<input type="checkbox" id="libraryBld" class="scienceCheck" onchange="verifyBuildingSelected(\'19\', \'libraryBld\')"><label for="libraryBld">Library</label><br />' +
	'	<input type="checkbox" id="academyBld" class="scienceCheck" onchange="verifyBuildingSelected(\'20\', \'academyBld\')"><label for="academyBld">Academy</label><br />' +
	'	<input type="checkbox" id="obervatoryBld" class="scienceCheck" onchange="verifyBuildingSelected(\'21\', \'obervatoryBld\')"><label for="obervatoryBld">Observatory</label><br /><br />' +

	'	<input type="checkbox" id="storageChecker"><label for="storageChecker" onclick="$(\'.storageCheck\').click();"><b>Storage</b></label><br />' +
	'	<input type="checkbox" id="barnBld" class="storageCheck" onchange="verifyBuildingSelected(\'22\', \'barnBld\')"><label for="barnBld">Barn</label><br />' +
	'	<input type="checkbox" id="harborBld" class="storageCheck" onchange="verifyBuildingSelected(\'23\', \'harborBld\')"><label for="harborBld">Harbor</label><br />' +
	'	<input type="checkbox" id="warehouseBld" class="storageCheck" onchange="verifyBuildingSelected(\'24\', \'warehouseBld\')"><label for="warehouseBld">Warehouse</label><br /><br />' +

	'	<input type="checkbox" id="otherChecker"><label for="otherChecker" onclick="$(\'.otherCheck\').click();"><b>Other</b></label><br />' +
	'	<input type="checkbox" id="ampBld" class="otherCheck" onchange="verifyBuildingSelected(\'25\', \'ampBld\')"><label for="ampBld">Amphitheatre/Broadcast</label><br />' +
	'	<input type="checkbox" id="tradeBld" class="otherCheck" onchange="verifyBuildingSelected(\'26\', \'tradeBld\')"><label for="tradeBld">Tradepost</label><br />' +
	'	<input type="checkbox" id="chapelBld" class="otherCheck" onchange="verifyBuildingSelected(\'27\', \'chapelBld\')"><label for="chapelBld">Chapel</label><br />' +
	'	<input type="checkbox" id="templeBld" class="otherCheck" onchange="verifyBuildingSelected(\'28\', \'templeBld\')"><label for="templeBld">Temple</label><br />' +
	'	<input type="checkbox" id="mintBld" class="otherCheck" onchange="verifyBuildingSelected(\'29\', \'mintBld\')"><label for="mintBld">Mint</label><br />' +
	'	<input type="checkbox" id="zigguratBld" class="otherCheck" onchange="verifyBuildingSelected(\'30\', \'zigguratBld\')"><label for="zigguratBld">Ziggurat</label><br />' +
	'	<input type="checkbox" id="unicBld" class="otherCheck" onchange="verifyBuildingSelected(\'31\', \'unicBld\')"><label for="unicBld">Unicorn Pasture</label><br /><br />' +

	'</div>';


	const spaceSelectAddition = '<div id="spaceSelect" style="display:none; margin-top:-400px; width:200px" class="dialog help">' +
	'<a href="#" onclick="$(\'#spaceSelect\').hide(); $(\'#buildingSelect\').toggle();" style="position: absolute; top: 10px; left: 15px;">cath</a>' +
	'<a href="#" onclick="$(\'#spaceSelect\').hide();" style="position: absolute; top: 10px; right: 15px;">close</a>' +

	'	<br /><br /><input type="checkbox" id="programs" class="programs" onchange="programBuild = this.checked;"><label for="programs">Programs</label><br /><br />' +

	'	<input type="checkbox" id="spaceChecker"><label for="spaceChecker" onclick="$(\'.spaceCheck\').click();"><b>Space</b></label><br />' +

	'	<input type="checkbox" id="elevSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'32\', \'elevSBld\');"><label for="elevSBld">Space Elevator</label><br />' +
	'	<input type="checkbox" id="satSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'33\', \'satSBld\');"><label for="satSBld">Satellite</label><br />' +
	'	<input type="checkbox" id="statSBld" class="spaceCheck" onchange="verifyBuildingSelected(\'34\', \'statSBld\');"><label for="statSBld">Space Station</label><br /><br />' +

	'	<input type="checkbox" id="moonChecker"><label for="moonChecker" onclick="$(\'.moonCheck\').click();"><b>Moon</b></label><br />' +

	'	<input type="checkbox" id="outSBld" class="moonCheck" onchange="verifyBuildingSelected(\'35\', \'outSBld\');"><label for="outSBld">Lunar Outpost</label><br />' +
	'	<input type="checkbox" id="baseSBld" class="moonCheck" onchange="verifyBuildingSelected(\'36\', \'baseSBld\');"><label for="baseSBld">Moon Base</label><br /><br />' +

	'	<input type="checkbox" id="duneChecker"><label for="duneChecker" onclick="$(\'.duneCheck\').click();"><b>Dune</b></label><br />' +


	'	<input type="checkbox" id="crackSBld" class="duneCheck" onchange="verifyBuildingSelected(\'37\', \'crackSBld\');"><label for="crackSBld">Planet Cracker</label><br />' +
	'	<input type="checkbox" id="fracSBld" class="duneCheck" onchange="verifyBuildingSelected(\'38\', \'fracSBld\');"><label for="fracSBld">Hydro Fracturer</label><br />' +
	'	<input type="checkbox" id="spiceSBld" class="duneCheck" onchange="verifyBuildingSelected(\'39\', \'spiceSBld\');"><label for="spiceSBld">Spice Refinery</label><br /><br />' +

	'	<input type="checkbox" id="piscineChecker"><label for="piscineChecker" onclick="$(\'piscineCheck\').click();"><b>Piscine</b></label><br />' +

	'	<input type="checkbox" id="reVeSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'40\', \'reVeSBld\');"><label for="reVeSBld">Research Vessel</label><br />' +
	'	<input type="checkbox" id="orbSBld" class="piscineCheck" onchange="verifyBuildingSelected(\'41\', \'orbSBld\');"><label for="orbSBld">Orbital Array</label><br /><br />' +

	'	<input type="checkbox" id="heliosChecker"><label for="heliosChecker" onclick="$(\'.heliosCheck\').click();"><b>Helios</b></label><br />' +

	'	<input type="checkbox" id="sunSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'42\', \'sunSBld\');"><label for="sunSBld">Sunlifter</label><br />' +
	'	<input type="checkbox" id="contSBld" class="heliosCheck" onchange="verifyBuildingSelected(\'43\', \'contSBld\');"><label for="contSBld">Containment Chamber</label><br /><br />' +

	'	<input type="checkbox" id="terminusChecker"><label for="terminusChecker" onclick="$(\'.terminusCheck\').click();"><b>Terminus</b></label><br />' +

	'	<input type="checkbox" id="crySBld" class="terminusCheck" onchange="verifyBuildingSelected(\'44\', \'crySBld\');"><label for="crySBld">Cryostation</label><br /><br />' +

	'	<input type="checkbox" id="kairoChecker"><label for="kairoChecker" onclick="$(\'.kairoCheck\').click();"><b>Kairo</b></label><br />' +

	'	<input type="checkbox" id="beacSBld" class="kairoCheck" onchange="verifyBuildingSelected(\'45\', \'beacSBld\');"><label for="beacSBld">Space Beacon</label><br /><br />' +

	'	<input type="checkbox" id="yarnChecker"><label for="yarnChecker" onclick="$(\'.yarnCheck\').click();"><b>Yarn</b></label><br />' +

	'	<input type="checkbox" id="terrSBld" class="yarnCheck" onchange="verifyBuildingSelected(\'46\', \'terrSBld\');"><label for="terrSBld">Terraforming Station</label><br />' +
	'	<input type="checkbox" id="hydrSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'47\', \'hydrSBld\');"><label for="hydrSBld">Hydroponics</label><br /><br />' +

	'	<input type="checkbox" id="centaurusChecker"><label for="centaurusChecker" onclick="$(\'.centaurusCheck\').click();"><b>Centaurus System</b></label><br />' +

	'	<input type="checkbox" id="tecSBld" class="centaurusCheck" onchange="verifyBuildingSelected(\'48\', \'tecSBld\');"><label for="tecSBld">Tectonic</label><br /><br />' +

	'</div>';


	// Insert the HTML
	$('#footerLinks').append(htmlMenuAddition);
	$('#game').append(bldSelectAddition);
	$('#game').append(spaceSelectAddition);
}


function verifyBuildingSelected(buildingNumber, buildingCheckID) {
	const bldIsChecked = document.getElementById(buildingCheckID).checked;
	buildings[buildingNumber][1] = bldIsChecked;
}

function clearOptionHelpDiv() {
	$('#optionSelect').hide();
}

function selectOptions() {
	$('#optionSelect').toggle();
}

function clearHelpDiv() {
	$('#buildingSelect').hide();
}

function selectBuildings() {
	$('#buildingSelect').toggle();
}

function setFurValue() {
	furDerVal = $('#craftFur').val();
}

function setAutoAssignValue() {
	autoChoice = $('#autoAssignChoice').val();
}

function autoSwitch(autoButton) {
	if (autoButton.active) {
		autoButton.active = false;
		gamePage.msg('Auto' + autoButton.swapName + ' is now off');
		document.getElementById(autoButton.buttonId).style.color = 'red';
	} else {
		autoButton.active = true;
		gamePage.msg('Auto' + autoButton.swapName + ' is now on');
		document.getElementById(autoButton.buttonId).style.color = 'black';
	}
}

// Kill the script
function clearScript() {
	$('#farRightColumn').remove();
	$('#buildingSelect').remove();
	$('#spaceSelect').remove();
	$('#scriptOptions').remove();
	clearInterval(runAllAutomation);
}

// Show current kitten efficiency in the in-game log
function kittenEfficiency() {
	const timePlayed = gamePage.stats.statsCurrent[3].calculate(game);
	const numberKittens = resources.kittens.value;
	const curEfficiency = (numberKittens - 70) / timePlayed;
	gamePage.msg('Your current efficiency is ' + parseFloat(curEfficiency).toFixed(2) + ' kittens per hour.');
}


/* These are the functions which are controlled by the runAllAutomation timer */

// Auto Observe Astronomical Events
function autoObserve() {
	const checkObserveBtn = document.getElementById('observeBtn');
	if (typeof(checkObserveBtn) != 'undefined' && checkObserveBtn != null) {
		document.getElementById('observeBtn').click();
	}
}


// Auto praise the sun
var templeBuilding = gamePage.bld.getBuildingExt('temple');
function autoPraise(){
	if (templeBuilding.meta.val > 0) {
		gamePage.religion.praise();
	}
}


// Build buildings automatically
function autoBuild() {
	// If we're not on the bonfire tab, don't build anything
	if (gamePage.ui.activeTabId != 'Bonfire') {
		return;
	}

	const buttons = gamePage.tabs[0].buttons;
	for (let z = 0; z < 32; z++) {
		const buildingName = buildingsList[z];
		if (buildings[z][1] && gamePage.bld.getBuildingExt(buildingName).meta.unlocked) {
			for (let i = 2; i < gamePage.tabs[0].buttons.length; i++) {
				try {
					const button = buttons[i];
					if (button.model.metadata.name == buildingName) {
						button.controller.buyItem(button.model, {}, function(result) {
							if (result) {
								button.update();

								// Set the triggerImmediate flag for this function, indicating it should be called again next tick
								dispatchFunctions.autoBuild.triggerImmediate = true;
							}
						});
					}
				} catch(err) {
					console.log(err);
				}
			}
		}
	}
}

// Build space stuff automatically
function autoSpace() {
	// Check space tab is unlocked
	if (!gamePage.spaceTab.visible) {
		return;
	}

	// Change the tab so that we can build
	const origTab = gamePage.ui.activeTabId;
	if (gamePage.ui.activeTabId != 'Space') {
		gamePage.ui.activeTabId = 'Space';
		gamePage.render();
	}

	// Build space buildings
	const planetPanels = gamePage.tabs[6].planetPanels;
	for (let z = 32; z < numBuildings; z++) {
		if (buildings[z][1]) {
			try {
				const buildingName = buildingsList[z];
				const planetButtons = planetPanels[buildings[z][2]].children;
				const numPlanetButtons = planetButtons.length;
				for (let i = 0; i < numPlanetButtons; i++) {
					const button = planetButtons[i];
					if (button.model.metadata.name == buildingName) {
						button.controller.buyItem(button.model, {}, function(result) {
							if (result) {
								button.update();

								// Set the triggerImmediate flag for this function, indicating it should be called again next tick
								dispatchFunctions.autoSpace.triggerImmediate = true;
							}
						});
					}
				}
			} catch(err) {
				console.log(err);
			}
		}
	}

	// Build space programs
	if (programBuild) {
		const programButtons = gamePage.tabs[6].GCPanel.children;
		const numProgramButtons = programButtons.length;
		for (let i = 0; i < numProgramButtons; i++) {
			const programButton = programButtons[i];
			if (programButton.model.metadata.unlocked && programButton.model.on == 0) {
				try {
					programButton.controller.buyItem(programButton.model, {}, function(result) {
						if (result) {
							programButton.update();

							// Set the triggerImmediate flag for this function, indicating it should be called again next tick
							dispatchFunctions.autoSpace.triggerImmediate = true;
						}
					});
				} catch(err) {
					console.log(err);
				}
			}
		}
	}

	if (origTab != gamePage.ui.activeTabId) {
		gamePage.ui.activeTabId = origTab;
		gamePage.render();
	}
}


// Trade automatically
var diplomacyPerk = gamePage.prestige.getPerk('diplomacy');
function autoTrade() {
	// If it is possible to trade with the Leviathan, we always want to do so
	if (races.leviathans.unlocked && (races.leviathans.duration > 0) && (gamePage.diplomacy.getMaxTradeAmt(races.leviathans) > 0)) {
		// If it is possible to trade with the Leviathans, we always wish to do so, and with the maximum amount possible
		gamePage.diplomacy.tradeAll(races.leviathans);
	}

	// Non-Leviathan trades are only performed if we are about to hit our gold cap; if we have room for enough gold to last until the next run of this function, abort
	if ((resources.gold.value + (gamePage.getResourcePerTick('gold', true) * dispatchFunctions.autoTrade.triggerInterval)) < resources.gold.maxValue) {
		return;
	}


	// Perform the non-Leviathan trades
	tradeZebras();
	tradeDragons();
	tradeSpiders();
	tradeGriffins();
}

// Trade with the Zebras
function tradeZebras() {
	// Check that the zebras are available to trade with
	if (!races.zebras.unlocked) {
		return;
	}

	// Check that our titanium stockpile isn't already filled beyond its normal capacity
	if (resources.titanium.value > (resources.titanium.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	const maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(races.zebras);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much titanium we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For titanium, this is purely a function of the number of ships you have with no seasonal or random variations and no effect from your trade ratio
	let expectedTitaniumPerTrade = 1.5 + (1.5  * (resources.ship.value / 100) * 2);

	// Then modify that by the effects of race relations
	// For the Zebras, this is the chance any given trade will fail because they are hostile
	const tradeChance = 70 + gamePage.getEffect('standingRatio') + (diplomacyPerk.researched ? 10 : 0);
	if (tradeChance < 100) {
		expectedTitaniumPerTrade *= tradeChance / 100;
	}

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For titanium, this depends on the number of ships you have
	const titaniumChance = 15 + (resources.ship.value * 0.35);
	if (titaniumChance < 100) {
		expectedTitaniumPerTrade *= titaniumChance / 100;
	}


	// Our target final titanium level is the maximum capacity of our stockpile, minus a buffer large enough to ensure it doesn't overflow before the next autoCraft() (assuming our titanium income is positive)
	const targetTitanium = resources.titanium.maxValue - Math.max(gamePage.getResourcePerTick('titanium', true) * dispatchFunctions.autoCraft.triggerInterval, 0);


	// Determine how many trades to perform
	// We want to trade for just enough titanium to fill our stockpile

	// Determine the amount of titanium needed to reach our target
	const titaniumRequired = targetTitanium - resources.titanium.value;

	// Determine how many trades are needed to get that much titanium, rounded down
	let tradesRequired = Math.floor(titaniumRequired / expectedTitaniumPerTrade);

	// The amount of titanium returned by a single trade, being a linear function of the number of ships you have, can potentially be arbitrarily large
	// Therefore, if our titanium stockpile is below 90%, we always perform a minimum of 1 trade, even if some of it will be wasted
	if (resources.titanium.value < (resources.titanium.maxValue * 0.9)) {
		tradesRequired = Math.max(tradesRequired, 1);
	}

	// If no trades are necessary, we're done
	if (tradesRequired < 1) {
		return;
	}

	// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
	const tradesToPerform = Math.min(tradesRequired, maxTradesPossible);


	// Besides the titanium, trading with the Zebras will also return some iron; we need ensure there is enough room in the stockpile for it, if possible
	if (crafts.plate.unlocked) {
		// Determine the maximum amount of iron we might receive from each trade:
		// A successful trade with the Zebras always returns iron; the amount starts at 300, boosted by your trade ratio and modified by a seasonal modifier and a random factor (-4% to +4%)
		// For this 'worst case' calculation, we will assume the largest possible random modifier and that all trades succeed
		const maxIronPerTrade = 300 * (1 + gamePage.diplomacy.getTradeRatio()) * races.zebras.sells[0].seasons[gamePage.calendar.getCurSeason().name] * 1.04;


		// Our target final iron level is the maximum capacity of our stockpile, minus a buffer large enough to ensure it doesn't overflow before the next autoCraft() (assuming our iron income is positive)
		const targetIron = resources.iron.maxValue - Math.max(gamePage.getResourcePerTick('iron', true) * dispatchFunctions.autoCraft.triggerInterval, 0);


		// Determine how much iron those trades might return
		const expectedIron = tradesToPerform * maxIronPerTrade;

		// Determine how much existing iron must be converted to steel to make room (up to a limit of 'all of it')
		const ironOverflow = Math.min((resources.iron.value + expectedIron) - targetIron, resources.iron.value);

		// Craft the necessary quantity of plates, if any, with each crafting consuming 125 units of iron
		if (ironOverflow > 0) {
			gamePage.craft('plate', ironOverflow / 125);
		}
	}


	// Perform the trades
	gamePage.diplomacy.tradeMultiple(races.zebras, tradesToPerform);
}

// Trade with the Dragons
function tradeDragons() {
	// Check that the Dragons are available to trade with
	if (!races.dragons.unlocked) {
		return;
	}

	// Check that our uranium stockpile isn't already filled beyond its normal capacity
	if (resources.uranium.value > (resources.uranium.maxValue + 1)) {
		return;
	}


	// Check that our titanium stockpile isn't filled beyond its normal capacity
	// An over-filled resource stockpile, which usually comes from resetting the game with chronospheres, can be used to purchase things that cost more than the stockpile capacity
	// It therefore represents an irreplaceable resource which should not be depleted automatically
	if (resources.titanium.value > (resources.titanium.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	const maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(races.dragons);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much uranium we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For uranium, this is 1 unit per trade boosted by your trade ratio, with no seasonal modifier
	// There's also what's supposed to be a random variation of +/- 12.5% (which would cancel itself out on average), but, due to a bug in the game code, actually ends up always returning the minimum possible amount
	let expectedUraniumPerTrade = 1 * (1 + gamePage.diplomacy.getTradeRatio()) * 0.875;

	// Then modify that by the effects of race relations
	// For the Dragons, this is nothing; the Dragons are neutral, so trades never fail entirely nor return extra

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For uranium, this is 5%
	expectedUraniumPerTrade *= 0.95;


	// Our target final uranium level is the maximum capacity of our stockpile, minus a buffer large enough to ensure it doesn't overflow before the next autoCraft() (assuming our uranium income is positive)
	const targetUranium = resources.uranium.maxValue - Math.max(gamePage.getResourcePerTick('uranium', true) * dispatchFunctions.autoCraft.triggerInterval, 0);


	// Determine how many trades to perform depending on the current trade mode
	let tradesToPerform;
	if (tradeMax.uranium) {
		// We are in maximize mode, which means we want to trade for as much uranium as possible, converting any excess into steel

		// Calculate the maximum number of trades we can make and fit the results into our target uranium level
		const maxTradesFit = Math.floor(targetUranium / expectedUraniumPerTrade);

		// If possible, we want to perform as many trades as we have the resources for; if we don't have enough space in the stockpile to do that, we just do as many as we can fit
		tradesToPerform = Math.min(maxTradesPossible, maxTradesFit);


		// Convert the excess uranium:
		// Determine how much uranium those trades will return
		const expectedUranium = tradesToPerform * expectedUraniumPerTrade;

		// Determine how much existing uranium must be converted to steel to make room (up to a limit of 'all of it')
		const uraniumOverflow = Math.min((resources.uranium.value + expectedUranium) - targetUranium, resources.uranium.value);

		// Craft the necessary quantity of thorium, with each crafting consuming 250 units of uranium
		gamePage.craft('thorium', uraniumOverflow / 250);
	} else {
		// We are in normal mode, which means we want to trade for just enough uranium to fill our stockpile

		// Determine the amount of uranium needed to reach our target
		const uraniumRequired = targetUranium - resources.uranium.value;

		// Determine how many trades are needed to get that much uranium, rounded down
		const tradesRequired = Math.floor(uraniumRequired / expectedUraniumPerTrade);

		// If no trades are necessary, we're done
		if (tradesRequired < 1) {
			return;
		}

		// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
		tradesToPerform = Math.min(tradesRequired, maxTradesPossible);
	}


	// Perform the trades
	gamePage.diplomacy.tradeMultiple(races.dragons, tradesToPerform);
}

// Trade with the Spiders
function tradeSpiders() {
	// Check that the Spiders are available to trade with
	if (!races.spiders.unlocked) {
		return;
	}

	// Check that our coal stockpile isn't already filled beyond its normal capacity
	if (resources.coal.value > (resources.coal.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	const maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(races.spiders);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much coal we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For coal, this is 350 units per trade boosted by your trade ratio, modified by a seasonal modifier; there's a random variation, but it's irrelevant since it cancels itself out
	let expectedCoalPerTrade = 350 * (1 + gamePage.diplomacy.getTradeRatio()) * races.spiders.sells[0].seasons[gamePage.calendar.getCurSeason().name];

	// Then modify that by the effects of race relations
	// For the Spiders, this is the chance any given trade will return 25% extra because they are friendly
	const bonusChance = 15 + ((gamePage.getEffect('standingRatio') + (diplomacyPerk.researched ? 10 : 0)) / 2);
	expectedCoalPerTrade *= 1 + (0.25 * (bonusChance <= 100 ? bonusChance : 100) / 100);

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For coal, this never happens


	// Our target final coal level is the maximum capacity of our stockpile, minus a buffer large enough to ensure it doesn't overflow before the next autoCraft() (assuming our coal income is positive)
	const targetCoal = resources.coal.maxValue - Math.max(gamePage.getResourcePerTick('coal', true) * dispatchFunctions.autoCraft.triggerInterval, 0);


	// Determine how many trades to perform depending on the current trade mode
	let tradesToPerform;
	if (tradeMax.coal) {
		// We are in maximize mode, which means we want to trade for as much coal as possible, converting any excess into steel

		// Determine the maximum amount of coal we can covert to steel right now
		const maxCoalCraftable = Math.min(resources.coal.value, resources.iron.value);

		// Determine the maximum amount of space that we can make available in our coal stockpile right now
		const maxCoalSpace = targetCoal - (resources.coal.value - maxCoalCraftable);

		// Calculate the maximum number of trades we can make and fit the results into that space
		const maxTradesFit = Math.floor(maxCoalSpace / expectedCoalPerTrade);

		// If possible, we want to perform as many trades as we have the resources for; if we don't have enough space in the stockpile to do that, we just do as many as we can fit
		tradesToPerform = Math.min(maxTradesPossible, maxTradesFit);


		// Convert the excess coal:
		// Determine how much coal those trades will return
		const expectedCoal = tradesToPerform * expectedCoalPerTrade;

		// Determine how much existing coal must be converted to steel to make room (up to a limit of 'all of it')
		const coalOverflow = Math.min((resources.coal.value + expectedCoal) - targetCoal, resources.coal.value);

		// Craft the necessary quantity of steel, with each crafting consuming 100 units of coal
		gamePage.craft('steel', coalOverflow / 100);
	} else {
		// We are in normal mode, which means we want to trade for just enough coal to fill our stockpile

		// Determine the amount of coal needed to reach our target
		const coalRequired = targetCoal - resources.coal.value;

		// Determine how many trades are needed to get that much coal, rounded down
		const tradesRequired = Math.floor(coalRequired / expectedCoalPerTrade);

		// If no trades are necessary, we're done
		if (tradesRequired < 1) {
			return;
		}

		// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
		tradesToPerform = Math.min(tradesRequired, maxTradesPossible);
	}

	// Perform the trades
	gamePage.diplomacy.tradeMultiple(races.spiders, tradesToPerform);
}

// Trade with the Griffins
function tradeGriffins() {
	// Check that the Griffins are available to trade with
	if (!races.griffins.unlocked) {
		return;
	}

	// Check that our iron stockpile isn't already filled beyond its normal capacity
	if (resources.iron.value > (resources.iron.maxValue + 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	const maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(races.griffins);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much iron we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For iron, this is 250 units per trade boosted by your trade ratio, modified by a seasonal modifier; there's a random variation, but it's irrelevant since it cancels itself out
	let expectedIronPerTrade = 250 * (1 + gamePage.diplomacy.getTradeRatio()) * races.griffins.sells[0].seasons[gamePage.calendar.getCurSeason().name];

	// Then modify that by the effects of race relations
	// For the Griffins, this is the chance any given trade will fail because they are hostile
	const tradeChance = 85 + gamePage.getEffect('standingRatio') + (diplomacyPerk.researched ? 10 : 0);
	if (tradeChance < 100) {
		expectedIronPerTrade *= tradeChance / 100;
	}

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For iron, this never happens


	// Our target final iron level is the maximum capacity of our stockpile, minus a buffer large enough to ensure it doesn't overflow before the next autoCraft() (assuming our iron income is positive)
	const targetIron = resources.iron.maxValue - Math.max(gamePage.getResourcePerTick('iron', true) * dispatchFunctions.autoCraft.triggerInterval, 0);


	// Determine how many trades to perform depending on the current trade mode
	let tradesToPerform;
	if (tradeMax.iron) {
		// We are in maximize mode, which means we want to trade for as much iron as possible, converting any excess into steel

		// Determine the maximum amount of iron we can covert to steel right now
		const maxIronCraftable = Math.min(resources.iron.value, resources.iron.value);

		// Determine the maximum amount of space that we can make available in our iron stockpile right now
		const maxIronSpace = targetIron - (resources.iron.value - maxIronCraftable);

		// Calculate the maximum number of trades we can make and fit the results into that space
		const maxTradesFit = Math.floor(maxIronSpace / expectedIronPerTrade);

		// If possible, we want to perform as many trades as we have the resources for; if we don't have enough space in the stockpile to do that, we just do as many as we can fit
		tradesToPerform = Math.min(maxTradesPossible, maxTradesFit);


		// Convert the excess iron:
		// Determine how much iron those trades will return
		const expectedIron = tradesToPerform * expectedIronPerTrade;

		// Determine how much existing iron must be converted to steel to make room (up to a limit of 'all of it')
		const ironOverflow = Math.min((resources.iron.value + expectedIron) - targetIron, resources.iron.value);

		// Craft the necessary quantity of steel, with each crafting consuming 100 units of iron
		gamePage.craft('steel', ironOverflow / 100);
	} else {
		// We are in normal mode, which means we want to trade for just enough iron to fill our stockpile

		// Determine the amount of iron needed to reach our target
		const ironRequired = targetIron - resources.iron.value;

		// Determine how many trades are needed to get that much iron, rounded down
		const tradesRequired = Math.floor(ironRequired / expectedIronPerTrade);

		// If no trades are necessary, we're done
		if (tradesRequired < 1) {
			return;
		}

		// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
		tradesToPerform = Math.min(tradesRequired, maxTradesPossible);
	}

	// Perform the trades
	gamePage.diplomacy.tradeMultiple(races.griffins, tradesToPerform);
}


// Trade for food to prevent starvation
function emergencyTradeFood() {
	// Check that the Sharks are available to trade with
	if (!races.sharks.unlocked) {
		return;
	}

	// We want to trade for food if our catnip reserves are dangerously low
	// For our purposes, that means we must have enough catnip to cover our deficit until the next time this function runs, plus a few extra ticks for safety
	// We also want to trade if we are below 2% of our maximum catnip, to cover the edge case where we have /already/ run completely out of catnip and therefore have a catnip income of 0
	const minSafeCatnip = Math.max((-gamePage.getResourcePerTick('catnip'), true) * (dispatchFunctions.emergencyTradeFood.triggerInterval + 4), resources.catnip.maxValue * 0.02);
	if (resources.catnip.value >  minSafeCatnip) {
		return;
	}

	// Sanity check: It is theoretically possible that our catnip stockpile does not contain the reserve we are demanding, yet is actually already full, because its simply too small to hold that much catnip, in which case there's nothing more we can do
	if (resources.catnip.value > (resources.catnip.maxValue - 1)) {
		return;
	}

	// Determine how many trades are possible given our current resources, and check that this number is not 0
	const maxTradesPossible = gamePage.diplomacy.getMaxTradeAmt(races.sharks);
	if ((maxTradesPossible === undefined) || (maxTradesPossible < 1)) {
		return;
	}


	// Determine how much catnip we can expect from each trade, on average:

	// First, calculate the amount of the desired resource returned by each trade if it manages to return any
	// For catnip, this is 35000 units per trade boosted by your trade ratio, modified by a seasonal modifier; there's a random variation, but it's irrelevant since it cancels itself out
	let expectedCatnipPerTrade = 35000 * (1 + gamePage.diplomacy.getTradeRatio()) * races.sharks.sells[0].seasons[gamePage.calendar.getCurSeason().name];

	// Then modify that by the effects of race relations
	// For the Sharks, this is nothing; the Sharks are neutral, so trades never fail entirely nor return extra

	// Then modify that by the chance that a successful trade will not include the desired resource in its results
	// For catnip, this never happens


	// We don't want to fill up our catnip stockpile; that would be unnecessarily wasteful and increase the chance that autoBuild will just deplete it again buying catnip fields or pastures
	// Instead, our target amount is 10 times our trigger amount
	let targetCatnip = minSafeCatnip * 10;

	// Sanity check: '10 times our trigger amount' might be larger than our entire stockpile, so cap it at that
	targetCatnip = Math.min(targetCatnip, resources.catnip.maxValue);


	// Determine how many trades to perform
	// We want to trade for just enough catnip to fill our stockpile to the calculated level

	// Determine the amount of catnip needed to reach our target
	const catnipRequired = targetCatnip - resources.catnip.value;

	// Determine how many trades are needed to get that much catnip, rounded up
	const tradesRequired = Math.ceil(catnipRequired / expectedCatnipPerTrade);

	// If possible, we want to perform as many trades as necessary to fill the stockpile; if we don't have enough resources to do that, we just do as many as we can
	const tradesToPerform = Math.min(tradesRequired, maxTradesPossible);


	// Perform the trades
	gamePage.diplomacy.tradeMultiple(races.sharks, tradesToPerform);
}


// Hunt automatically
function autoHunt() {
	// Trigger the hunt if we're within 1 tick of maxing out our catpower
	const catpowerPerTick = gamePage.getResourcePerTick('manpower', true);
	if ((resources.manpower.value + catpowerPerTick) > resources.manpower.maxValue) {
		gamePage.village.huntAll();
	}

	// Determine on which future tick our catpower resource will be maxed out, and set the dispatcher to call this function again on that tick
	// Note that this does not /prevent/ the function from being called sooner due to another trigger condition
	const ticksToFull = Math.floor((resources.manpower.maxValue - resources.manpower.value) / catpowerPerTick);
	const curTick = gamePage.timer.ticksTotal;
	dispatchFunctions.autoHunt.triggerTick = curTick + ticksToFull;
}


// Craft primary resources automatically
function autoCraft() {
	// Perform no crafting during temporal paradox
	if (gamePage.calendar.day < 0) {
		return;
	}

	// Perform all the non-fur-derivative craftings
	let ironCrafted = 0;
	const targetCraftPortion = craftPortion / 100;
	const baseIncomeDivertPortion = craftIncome / 100;
	for (let i = 0; i < numCraftings; i++) {
		const crafting = craftings[i];

		// The proportion of per-tick income to divert is controlled by the value in the text box, with the following exceptions:
		//   * For catnip-to-wood, we want to halt income diversion once our direct wood income is greater than 1 unit per tick; only in the early game, when we have little or no direct wood income, is diverting catnip for conversion useful; later on, our direct wood income greatly dominates what we could get by converting catnip, so it's better to save the catnip to fill the stockpile faster
		//   * For unobtainium-to-eludium, we want to halt income diversion any time the Leviathans are available for trade, to maximize the number of trades we can perform with them before they leave
		const incomeDivertPortion = (
				((crafting.name == 'wood') && (gamePage.getResourcePerTick('wood', true) > 1))
				|| ((crafting.name == 'eludium') && races.leviathans.unlocked && (races.leviathans.duration > 0))
			) ? 0 : baseIncomeDivertPortion;

		// When crafting steel, we cap the first ingredient (iron) at 75% of the available amount, to ensure some is left over for crafting plates; otherwise we apply no cap
		const incomeCapPortion = (crafting.name == 'steel') ? 0.75 : 1;

		// When crafting plates, we must consider the iron spent on crafting steel when calculating how much is still available for crafting
		const incomeAlredySpent = (crafting.name == 'plate') ? ironCrafted : 0;

		// Perform the crafting
		const firstIngredientConsumed = craft(crafting, targetCraftPortion, incomeDivertPortion, incomeCapPortion, incomeAlredySpent);

		// After crafting steel, we must record how much iron was spent so it can be accounted for when later crafting plates
		if (crafting.name == 'steel') {
			ironCrafted += firstIngredientConsumed;
		}
	}


	// If the fur derivatives dropdown is set to 'None' (value 0), we're done, otherwise we need to craft the fur derivative
	if (furDerVal <= 0) {
		return;
	}


	// Craft fur into parchment
	const targetFurDerivativeCraftPortion = furDerivativeCraftPortion / 100;
	craft(furDerivativeCraftings.parchment, targetFurDerivativeCraftPortion, baseIncomeDivertPortion, 1, 0);

	// If the fur derivatives dropdown is set to 'Parchment' (value 1), we're done
	if (furDerVal <= 1) {
		return;
	}


	// Craft parchment into manuscripts
	craft(furDerivativeCraftings.manuscript, targetFurDerivativeCraftPortion, baseIncomeDivertPortion, 1, 0);

	// If the fur derivatives dropdown is set to 'Manuscript' (value 2), we're done
	if (furDerVal <= 2) {
		return;
	}


	// Check whether we're crafting just compedia (fur derivatives dropdown set to 'Compendium' (value 3)) or both compedia and blueprints (fur derivatives dropdown set to 'Blueprint' (value 4))
	if (furDerVal <= 3) {
		// Craft manuscripts into compedia, using all available science
		craft(furDerivativeCraftings.compedium, targetFurDerivativeCraftPortion, baseIncomeDivertPortion, 1, 0);
	} else {
		// Craft manuscripts into compedia, using no more than 25% of the available science, and record how much science was used in the process
		let scienceCrafted = craft(furDerivativeCraftings.compedium, targetFurDerivativeCraftPortion, baseIncomeDivertPortion, 0.25, 0);

		// Craft compedia into blueprints, using as much of the remaining available science as possible, and record how much science was used in the process
		scienceCrafted += craft(furDerivativeCraftings.blueprint, targetFurDerivativeCraftPortion, baseIncomeDivertPortion, 1, scienceCrafted);

		// Craft manuscripts into compedia again, to use up any remaining available science
		craft(furDerivativeCraftings.compedium, targetFurDerivativeCraftPortion, baseIncomeDivertPortion, 1, scienceCrafted);
	}
}

var catnipEnrichmentUpgrade = gamePage.workshop.get('advancedRefinement');
var satelliteBuilding = gamePage.space.getBuilding('sattelite');
function craft(crafting, targetCraftPortion, incomeDivertPortion, incomeCapPortion, incomeAlredySpent) {
	// Sanity check: make sure this resource is in the resource and craft caches
	if (!(crafting.name in crafts)) {
		console.log('Unkown craft ' + crafting.name);
		return 0;
	}
	if (!(crafting.name in resources)) {
		console.log('Unkown resource ' + crafting.name);
		return 0;
	}

	const outputResource = resources[crafting.name];

	// Check that this craft is unlocked
	if (!crafts[crafting.name].unlocked) {
		return 0;
	}

	// Calculate how much of this resource will be produced per crafting
	const outputResourceGeneratedPerCrafting = gamePage.getResCraftRatio(outputResource) + 1;

	// Calculate how many craftings our current stockpile of this resource represents
	const outputResourceExistingCraftings = outputResource.value / outputResourceGeneratedPerCrafting;

	// Check each source resource to find the number of craftings we can perform
	let craftingsToPerform = Infinity;
	const numIngredients = crafting.ingredients.length;
	for (let i = 0; i < numIngredients; i++) {
		const ingredient = crafting.ingredients[i];
		const sourceResource = resources[ingredient.name];

		// Sanity check: make sure this resource is in the resource and craft caches
		if (!(ingredient.name in resources)) {
			console.log('Unkown resource ' + ingredient.name);
			return 0;
		}

		// If this source resource has a stockpile limit, and that limit is to small to perform one full crafting of the output resource, perform no craftings
		// This is to prevent autoCraft from becoming an exploit  by producing resources, mainly eludium, that you shouldn't be able to craft at all yet
		if (sourceResource.maxValue && (sourceResource.maxValue < ingredient.amount)) {
			return 0;
		}

		// Special cases:
		//   * When crafting wood, the amount of catnip required per crafting depends on if you've researched Catnip Enrichment
		//   * When crafting ships, if you've researched Satellite Navigation, the number of starcharts required per crafting depends on how many satellites you have
		if ((crafting.name == 'wood') && (ingredient.name == 'catnip')) {
			ingredient.amount = catnipEnrichmentUpgrade.researched ? 50 : 100;
		} else if ((crafting.name == 'ship') && (ingredient.name == 'starchart')) {
			ingredient.amount = 25 * (1 - gamePage.getHyperbolicEffect(gamePage.getEffect('satnavRatio') * satelliteBuilding.on, 0.75));
		}

		// Calculate how much of this source resource our current stockpile of the output resource represents
		const alreadyCraftedEquivelent = outputResourceExistingCraftings * ingredient.amount;

		// Calculate how much of this source resource is available for crafting
		const sourceResourceAvailableForCrafting = resourceAvailableForCrafting(ingredient.name, targetCraftPortion, alreadyCraftedEquivelent, incomeDivertPortion, incomeCapPortion, incomeAlredySpent);

		// The supplied incomeCapPortion and incomeAlredySpent values apply only to the first source resource
		incomeCapPortion = 1;
		incomeAlredySpent = 0;

		// If we have no resources to craft, craft nothing
		// We use 0.0001 rather than 0 as our minimum to avoid extremely small craftings due to floating point accuracy limits
		if (sourceResourceAvailableForCrafting <= 0.0001) {
			return 0;
		}

		// Calculate the maximum number of craftings we can perform from this resource
		const maxCraftingsPossible = sourceResourceAvailableForCrafting / ingredient.amount;

		// If we cannot perform as many craftings as we were planning to, reduce the number we were planning to perform
		craftingsToPerform = Math.min(craftingsToPerform, maxCraftingsPossible);
	}


	// Special case: When crafting catnip-to-wood, we potentially need to make room in the wood stockpile first
	if ((crafting.name == 'wood') && crafts.beam.unlocked) {
		// Calculate how much wood we are about to create
		const totalWoodGenerated = outputResourceGeneratedPerCrafting * craftingsToPerform;

		// Calculate how much of this wood would be wasted
		const woodOverflow = resources.wood.value + totalWoodGenerated - resources.wood.maxValue;

		// Craft the excess wood into beams
		if (woodOverflow > 0.0001) {
			const beamCraftingsToPerform = woodOverflow / 175;
			gamePage.craft('beam', beamCraftingsToPerform);
		}
	}


	// Special case: When crafting uranium-to-thorium, if the appropriate switch is set, override the normal crafting limits to ensure we produce enough thorium to supply our reactors
	if (craftThoriumShortfall && (crafting.name == 'thorium')) {
		// FIXME: getResourcePerTick() always returns 0 for thorium due to a bug in the game code; using a manual calculation as a workaround for now
		//const thoriumConsumption = -gamePage.getResourcePerTick('thorium', true);
		const reactorBuilding = gamePage.bld.buildingsData[23];
		const thoriumConsumption = reactorBuilding.isAutomationEnabled ? (reactorBuilding.on * 0.05) : 0;

		// Calculate how much thorium we need until the next call of autoCraft, plus a buffer
		const targetThorium = (thoriumConsumption * (dispatchFunctions.autoCraft.triggerInterval + 2)) + 10;

		// Calculate how much more thorium we need to craft to reach that
		const thoriumShortage = targetThorium - resources.thorium.value;
		if (thoriumShortage > 0) {
			// Calculate how many craftings we need to perform to get that much thorium
			const craftingsRequired = thoriumShortage / outputResourceGeneratedPerCrafting;

			// If that number is more than we had previously planned to do, we use that number instead
			craftingsToPerform = Math.max(craftingsToPerform, craftingsRequired);

			// However, we cannot perform more craftings than we actually have uranium for
			const maxCraftingsPossible = resources.uranium.value / 250;
			craftingsToPerform = Math.min(craftingsToPerform, maxCraftingsPossible);
		}
	}


	// Perform the craftings
	gamePage.craft(crafting.name, craftingsToPerform);

	// Calculate and return how much of the first ingredient was used by the craftings
	return craftingsToPerform * crafting.ingredients[0].amount;
}

function resourceAvailableForCrafting(resourceName, targetCraftPortion, alreadyCraftedEquivelent, incomeDivertPortion, incomeCapPortion, incomeAlredySpent) {
	const curResource = resources[resourceName];

	// Special case: Fur
	if (resourceName == 'furs') {
		// We want to keep a reserve of furs large enough to last until the next hunt, so that we never lose the +10% happiness bonus from having fur in stock

		// Calculate the number of ticks until the next hunt, plus 2 as a safety margin
		const ticksReserveRequired = Math.floor((resources.manpower.maxValue - resources.manpower.value) / gamePage.getResourcePerTick('manpower', true)) + 2;

		// Calculate how much fur will be consumed until then, or 0 if our fur income is positive
		const furReserveRequired = Math.max(-gamePage.getResourcePerTick('furs', true) * ticksReserveRequired, 0);

		// Reserve the calculated amount of fur, plus 100 units
		const targetFur = furReserveRequired + 100;

		// The amount of fur available for crafting is everything beyond the calculated target (minimum 0)
		return Math.max(curResource.value - targetFur, 0);
	}


	// Special case: Coal
	if (resourceName == 'coal') {
		// Coal has no useful purposes whatsoever except for being crafted into steel. Therefore, we should always be willing to diver 100% of our income towards crafting rather than trying to build up a stockpile...
		incomeDivertPortion = 1;

		// ... and we should always be willing to craft as much as possible, no matter how much has already been crafted
		targetCraftPortion = 1;
	}


	// Our goal is to use a fixed percentage of our production of each source resource for crafting; calculate, from the amount of this resource we have stockpiled and the amount that has already been crafted, how much we need to craft now to make that so

	// Calculate the total amount of this resource in the system
	const totalResourceAmount = curResource.value + alreadyCraftedEquivelent;

	// Multiply that total by the desired crafting portion to find the amount that should be crafted
	const targetCraftedResource = totalResourceAmount * targetCraftPortion;

	// Finally, subtract the amount already crafted to find the amount that needs to be crafted (minimum 0)
	let availableForCrafting = Math.max(targetCraftedResource - alreadyCraftedEquivelent, 0);


	// For resources which have a stockpile limit, there are additional complications
	if (curResource.maxValue) {
		// If this resource's stockpile is substantially over its limit, we don't want to craft anything, because an overfull stockpile can be used to purchase buildings or upgrades that cost more than the normal stockpile limit
		// Coal is exempted from this, since it has no uses whatsoever /except/ for crafting
		if ((resourceName != 'coal') && (curResource.value > (curResource.maxValue * 1.1))) {
			return 0;
		}

		const resourceIncome = Math.max(gamePage.getResourcePerTick(resourceName, true) * dispatchFunctions.autoCraft.triggerInterval, 0);

		// We want to divert a certain percentage of our per-tick income of this resource to crafting, even if we are nowhere near the stockpile limit

		// First, take the specified diversion portion from our per-tick income
		const divertedIncome = resourceIncome * incomeDivertPortion;

		// We may have already spent some of the divertable income for this resource crafting other things this turn; if so subtract that to find the amount still available (minimum 0)
		const divertedIncomeRemaining = Math.max(divertedIncome - incomeAlredySpent, 0);

		// We may wish to only use a part of the diverted income on this craft, so as to save some for other crafts later
		const cappedDivertedIncome = divertedIncomeRemaining * incomeCapPortion;

		// We use either the calculated income diversion or the previously calculated target-total-crafted-amount; that way, if we already have a large amount of the crafted resource, our full income goes to rebuilding our stockpile
		availableForCrafting = Math.min(availableForCrafting, cappedDivertedIncome);


		// If this resource is near its stockpile limit, we want to use up enough of the resource in crafting to prevent overflow

		// First, calculate the potential overflow
		const resourceOverflow = (curResource.value + resourceIncome) - curResource.maxValue;

		// We may wish to only use a part of the overflow on this craft, so as to save some for other crafts later
		const cappedOverflow = resourceOverflow * incomeCapPortion;

		// If the overflow exceeds the previously calculated target-total-crafted-amount, we use the overflow, since it would be wasted otherwise
		availableForCrafting = Math.max(availableForCrafting, cappedOverflow);
	}


	// Sanity check: we cannot craft more than we have
	availableForCrafting = Math.min(availableForCrafting, curResource.value);


	// Return the calculated amount
	return availableForCrafting;
}


// Auto Research
function autoResearch() {
	// Check science tab is unlocked
	if (!gamePage.libraryTab.visible) {
		return;
	}

	const origTab = gamePage.ui.activeTabId;
	gamePage.ui.activeTabId = 'Science';
	gamePage.render();

	const buttons = gamePage.tabs[2].buttons;
	const numButtons = buttons.length;
	for (let i = 0; i < numButtons; i++) {
		const button = buttons[i];
		if (button.model.metadata.unlocked && button.model.metadata.researched != true) {
			try {
				button.controller.buyItem(button.model, {}, function(result) {
					if (result) {
						button.update();

						// Set the triggerImmediate flag for this function, indicating it should be called again next tick
						dispatchFunctions.autoResearch.triggerImmediate = true;
					}
				});
			} catch(err) {
				console.log(err);

			}
		}
	}

	if (origTab != gamePage.ui.activeTabId) {
		gamePage.ui.activeTabId = origTab;
		gamePage.render();

	}
}


// Auto Workshop upgrade
function autoWorkshop() {
	// Check workshop tab is unlocked
	if (!gamePage.workshopTab.visible) {
		return;
	}

	const origTab = gamePage.ui.activeTabId;
	gamePage.ui.activeTabId = 'Workshop';
	gamePage.render();

	const buttons = gamePage.tabs[3].buttons;
	const numButtons = buttons.length;
	for (let i = 0; i < numButtons; i++) {
		const button = buttons[i];
		if (button.model.metadata.unlocked && button.model.metadata.researched != true) {
			try {
				button.controller.buyItem(button.model, {}, function(result) {
					if (result) {
						button.update();

						// Set the triggerImmediate flag for this function, indicating it should be called again next tick
						dispatchFunctions.autoWorkshop.triggerImmediate = true;
					}
				});
			} catch(err) {
				console.log(err);

			}
		}
	}

	if (origTab != gamePage.ui.activeTabId) {
		gamePage.ui.activeTabId = origTab;
		gamePage.render();

	}
}


// Festival automatically
var dramaTech = gamePage.science.get('drama');
var carnivalsPerk = gamePage.prestige.getPerk('carnivals');
function autoParty() {
	if (
		dramaTech.researched
		&& (resources.manpower.value > 1500)
		&& (resources.culture.value > 5000)
		&& (resources.parchment.value > 2500)
		&& (gamePage.calendar.festivalDays < 4000)
		&& (carnivalsPerk.researched || (gamePage.calendar.festivalDays = 0))
	) {
		gamePage.village.holdFestival(1);
	}
}


// Auto assign new kittens to selected job
function autoAssign() {
	const chosenJob = gamePage.village.getJob(autoChoice);
	if (chosenJob.unlocked && (gamePage.village.getFreeKittens() > 0)) {
		gamePage.village.assignJob(chosenJob);

		// Set the triggerImmediate flag for this function, indicating it should be called again next tick
		dispatchFunctions.autoAssign.triggerImmediate = true;
	}
}


// Control Energy Consumption
var smelterBuilding = gamePage.bld.buildingsData[15];
var bioLabBuilding = gamePage.bld.buildingsData[9];
var oilWellBuilding = gamePage.bld.buildingsData[20];
var factoryBuilding = gamePage.bld.buildingsData[22];
var calcinerBuilding = gamePage.bld.buildingsData[16];
var acceleratorBuilding = gamePage.bld.buildingsData[24];
function energyControl() {
	const netEnergy = gamePage.resPool.energyProd - gamePage.resPool.energyCons;

	if (netEnergy <= 0) {
		// Preemptively set the triggerImmediate flag for this function, indicating it should be called again next tick
		dispatchFunctions.energyControl.triggerImmediate = true;

		if (bioLabBuilding.on > 0) {
			bioLabBuilding.on--;
		} else if (oilWellBuilding.on > 0) {
			oilWellBuilding.on--;
		} else if (factoryBuilding.on > 0) {
			factoryBuilding.on--;
		} else if (calcinerBuilding.on > 0) {
			calcinerBuilding.on--;
		} else if (acceleratorBuilding.on > 0) {
			acceleratorBuilding.on--;
		} else {
			// Clear the triggerImmediate flag, since no changes were actually made
			dispatchFunctions.energyControl.triggerImmediate = false;
		}
	} else if (netEnergy > 3) {
		// Preemptively set the triggerImmediate flag for this function, indicating it should be called again next tick
		dispatchFunctions.energyControl.triggerImmediate = true;

		if (acceleratorBuilding.val > acceleratorBuilding.on) {
			acceleratorBuilding.on++;
		} else if (calcinerBuilding.val > calcinerBuilding.on) {
			calcinerBuilding.on++;
		} else if (factoryBuilding.val > factoryBuilding.on) {
			factoryBuilding.on++;
		} else if (oilWellBuilding.val > oilWellBuilding.on) {
			oilWellBuilding.on++;
		} else if (bioLabBuilding.val > bioLabBuilding.on) {
			bioLabBuilding.on++;
		} else {
			// Clear the triggerImmediate flag, since no changes were actually made
			dispatchFunctions.energyControl.triggerImmediate = false;
		}
	}
}


// Gather catnip
var catnipFieldBuilding = gamePage.bld.buildingsData[0];
function autoNip() {
	if (catnipFieldBuilding.val < 30) {
		$('.btnContent:contains("Gather")').trigger('click');

		// Set the triggerImmediate flag for this function, so that it is called again next tick
		dispatchFunctions.autoNip.triggerImmediate = true;
	}
}


var dispatchFunctions = {
	autoCraft: {
		functionRef: autoCraft,
		triggerInterval: 1,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoCraft
	},
	autoObserve: {
		functionRef: autoObserve,
		triggerInterval: 5,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.alwaysOn
	},
	autoBuild: {
		functionRef: autoBuild,
		triggerInterval: 10,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoBuild
	},
	autoSpace: {
		functionRef: autoSpace,
		triggerInterval: 10,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoBuild
	},
	autoAssign: {
		functionRef: autoAssign,
		triggerInterval: 10,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoAssign
	},
	energyControl: {
		functionRef: energyControl,
		triggerInterval: 10,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoEnergy
	},
	autoResearch: {
		functionRef: autoResearch,
		triggerInterval: 20,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoScience
	},
	autoWorkshop: {
		functionRef: autoWorkshop,
		triggerInterval: 20,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoUpgrade
	},
	autoNip: {
		functionRef: autoNip,
		triggerInterval: 20,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoBuild
	},
	autoParty: {
		functionRef: autoParty,
		triggerInterval: 20,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoParty
	},
	autoTrade: {
		functionRef: autoTrade,
		triggerInterval: 10,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoTrade
	},
	autoPraise: {
		functionRef: autoPraise,
		triggerInterval: 20,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoPraise
	},
	autoHunt: {
		functionRef: autoHunt,
		triggerInterval: 20,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.autoHunt
	},
	emergencyTradeFood: {
		functionRef: emergencyTradeFood,
		triggerInterval: 1,
		triggerImmediate: true,
		triggerTick: Infinity,
		autoButton: autoButtons.alwaysOn
	},
};

var dispatchOrder = [
	'autoAssign',
	'emergencyTradeFood',
	'autoTrade',
	'autoHunt',
	'autoObserve',
	'autoResearch',
	'autoWorkshop',
	'autoBuild',
	'autoSpace',
	'autoCraft',
	'energyControl',
	'autoNip',
	'autoParty',
	'autoPraise'
];
var numDispatches = dispatchOrder.length;

// This function keeps track of the game's ticks and uses math to execute these functions at set times relative to the game.
clearInterval(runAllAutomation);
var lastTick = Number.NEGATIVE_INFINITY;
var runAllAutomation = setInterval(function() {
	// Check how many ticks have passed since the last time we executed
	const curTick = gamePage.timer.ticksTotal;
	const ticksElapsed = curTick - lastTick;

	// Update the last execution tick
	lastTick = curTick;

	// If this is still the same tick as when we last executed, abort
	if (ticksElapsed < 1) {
		return;
	}

	// Dispatch each function in order
	for (let i = 0; i < numDispatches; i++) {
		curFunction = dispatchFunctions[dispatchOrder[i]];

		// A function is triggered when the corresponding button is active and any of 3 conditions are true:
		//   * The current tick is a multiple of the function's dispatch interval
		//   * The function set its triggerImmediate flag to true during its last run, indicating it wanted to be called again immediately
		//   * The function set a triggerTick value, indicating a specific tick it wanted to be called again on, and that tick has arrived
		// However, for the 1st and 3rd conditions, we must also account for the possibility that the dispatcher might not run every tick, in which case the function should be triggered as soon as possible after its intended trigger tick
		if (curFunction.autoButton.active && (curFunction.triggerImmediate || (curFunction.triggerTick <= curTick) || ((curTick % curFunction.triggerInterval) < ticksElapsed))) {
			// Clear the triggerImmediate flag and the triggerTick value; if the function wants to use them again it must reset them during its execution
			curFunction.triggerImmediate = false;
			curFunction.triggerTick = Infinity;

			// Execute the function
			curFunction.functionRef();
		}
	}
}, 50);

