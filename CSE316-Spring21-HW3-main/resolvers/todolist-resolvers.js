const ObjectId = require('mongoose').Types.ObjectId;
const Todolist = require('../models/todolist-model');

// The underscore param, "_", is a wildcard that can represent any value;
// here it is a stand-in for the parent parameter, which can be read about in
// the Apollo Server documentation regarding resolvers

module.exports = {
	Query: { //Query used to fetch data
		/** 
		 	@param 	 {object} req - the request object containing a user id
			@returns {array} an array of todolist objects on success, and an empty array on failure
		**/
		getAllTodos: async (_, __, { req }) => {
			const _id = new ObjectId(req.userId);
			if(!_id) { return([])};
			const todolists = await Todolist.find({owner: _id});
			if(todolists) return (todolists);

		},
		/** 
		 	@param 	 {object} args - a todolist id
			@returns {object} a todolist on success and an empty object on failure
		**/
		getTodoById: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const todolist = await Todolist.findOne({_id: objectId});
			if(todolist) return todolist;
			else return ({});
		},
	},
	Mutation: { //Mutation used to modify data
		/** 
		 	@param 	 {object} args - a todolist id and an empty item object
			@returns {string} the objectID of the item or an error message
		**/
		addItem: async(_, args) => {
			const { _id, item } = args;
			const listId = new ObjectId(_id);
			const objectId = new ObjectId();
			const found = await Todolist.findOne({_id: listId});
			if(!found) return ('Todolist not found');
			if(item._id === ''){
				item._id = objectId;
			}
			let listItems = found.items;
			listItems.push(item);
			
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems });

			if(updated) return (objectId);
			else return ('Could not add item');
		},
		/** 
		 	@param 	 {object} args - an empty todolist object
			@returns {string} the objectID of the todolist or an error message
		**/
		addTodolist: async (_, args) => {
			const { todolist } = args;
			const objectId = new ObjectId();
			const { id, name, owner, items, position } = todolist;
			const newList = new Todolist({
				_id: objectId,
				id: id,
				name: name,
				owner: owner,
				items: items,
				position: position
			});
			const updated = await newList.save();
			if(updated) return objectId;
			else return ('Could not add todolist');
		},
		/** 
		 	@param 	 {object} args - a todolist objectID and item objectID
			@returns {array} the updated item array on success or the initial 
							 array on failure
		**/
		deleteItem: async (_, args) => {
			const  { _id, itemId } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			listItems = listItems.filter(item => item._id.toString() !== itemId);
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);

		},
		/** 
		 	@param 	 {object} args - a todolist objectID 
			@returns {boolean} true on successful delete, false on failure
		**/
		deleteTodolist: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const deleted = await Todolist.deleteOne({_id: objectId});
			if(deleted) return true;
			else return false;
		},
		/** 
		 	@param 	 {object} args - a todolist objectID, field, and the update value
			@returns {boolean} true on successful update, false on failure
		**/
		updateTodolistField: async (_, args) => {
			const { field, value, _id } = args;
			const objectId = new ObjectId(_id);
			const updated = await Todolist.updateOne({_id: objectId}, {[field]: value});
			if(updated) return value;
			else return "";
		},
		/** 
			@param	 {object} args - a todolist objectID, an item objectID, field, and
									 update value. Flag is used to interpret the completed 
									 field,as it uses a boolean instead of a string
			@returns {array} the updated item array on success, or the initial item array on failure
		**/
		updateItemField: async (_, args) => {
			const { _id, itemId, field,  flag } = args;
			let { value } = args
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			if(flag === 1) {
				if(value === 'complete') { value = true; }
				if(value === 'incomplete') { value = false; }
			}
			listItems.map(item => {
				if(item._id.toString() === itemId) {	
					
					item[field] = value;
				}
			});
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			else return (found.items);
		},
		/**
			@param 	 {object} args - contains list id, item to swap, and swap direction
			@returns {array} the reordered item array on success, or initial ordering on failure
		**/
		reorderItems: async (_, args) => {
			const { _id, itemId, direction } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			const index = listItems.findIndex(item => item._id.toString() === itemId);
			// move selected item visually down the list
			if(direction === 1 && index < listItems.length - 1) {
				let next = listItems[index + 1];
				let current = listItems[index]
				listItems[index + 1] = current;
				listItems[index] = next;
			}
			// move selected item visually up the list
			else if(direction === -1 && index > 0) {
				let prev = listItems[index - 1];
				let current = listItems[index]
				listItems[index - 1] = current;
				listItems[index] = prev;
			}
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			// return old ordering if reorder was unsuccessful
			listItems = found.items;
			return (found.items);

		},
		
		sortItemsByColumn: async (_, args) => {
			const { _id, orientation } = args;
			const listID = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listID}); //ensure that a list with the ListID exists
			let listItems = found.items;
			if(orientation === 0){ //sort by task
				let flag = false;
				for(let i = 0; i < listItems.length - 1; i++){
					let lowest = i;
					let temp = listItems[i];
					for(let j = i + 1; j < listItems.length; j++){
						if(listItems[j].description.toUpperCase().localeCompare(listItems[lowest].description.toUpperCase()) < 0){
							lowest = j;
							flag = true;
						}
					}
					listItems[i] = listItems[lowest];
					listItems[lowest] = temp;
				}
				if(!flag){
					let middle = Math.floor(listItems.length/2);
					let endIndex = listItems.length - 1;
					for(let i = 0; i < middle; i++){
						let temp = listItems[endIndex - i];
						listItems[endIndex - i] = listItems[i];
						listItems[i] = temp;
					}
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 1){ //sort by task (reverse)
				let middle = Math.floor(listItems.length/2);
				let endIndex = listItems.length - 1;
				for(let i = 0; i < middle; i++){
					let temp = listItems[endIndex - i];
					listItems[endIndex - i] = listItems[i];
					listItems[i] = temp;
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 2){ //sort by due date
				let flag = false;
				for(let i = 0; i < listItems.length - 1; i++){
					let lowest = i;
					let temp = listItems[i];
					for(let j = i + 1; j < listItems.length; j++){
						if(listItems[j].due_date.toString().localeCompare(listItems[lowest].due_date.toString()) < 0){
							lowest = j;
							flag = true;
						}
					}
					listItems[i] = listItems[lowest];
					listItems[lowest] = temp;
				}
				if(!flag){
					let middle = Math.floor(listItems.length/2);
					let endIndex = listItems.length - 1;
					for(let i = 0; i < middle; i++){
						let temp = listItems[endIndex - i];
						listItems[endIndex - i] = listItems[i];
						listItems[i] = temp;
					}
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 3){ //sort by due date (reverse)
				let middle = Math.floor(listItems.length/2);
				let endIndex = listItems.length - 1;
				for(let i = 0; i < middle; i++){
					let temp = listItems[endIndex - i];
					listItems[endIndex - i] = listItems[i];
					listItems[i] = temp;
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 4){ // sort by status
				let flag = false;
				for(let i = 0; i < listItems.length - 1; i++){
					let lowest = i;
					let temp = listItems[i];
					for(let j = i + 1; j < listItems.length; j++){
						if(listItems[j].completed.toString().localeCompare(listItems[lowest].completed.toString()) < 0){
							lowest = j;
							flag = true;
						}
					}
					listItems[i] = listItems[lowest];
					listItems[lowest] = temp;
				}
				if(!flag){
					let middle = Math.floor(listItems.length/2);
					let endIndex = listItems.length - 1;
					for(let i = 0; i < middle; i++){
						let temp = listItems[endIndex - i];
						listItems[endIndex - i] = listItems[i];
						listItems[i] = temp;
					}
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 5){ // sort by status (reverse)
				let middle = Math.floor(listItems.length/2);
				let endIndex = listItems.length - 1;
				for(let i = 0; i < middle; i++){
					let temp = listItems[endIndex - i];
					listItems[endIndex - i] = listItems[i];
					listItems[i] = temp;
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 6){
				let flag = false;
				for(let i = 0; i < listItems.length - 1; i++){
					let lowest = i;
					let temp = listItems[i];
					for(let j = i + 1; j < listItems.length; j++){
						if(listItems[j].assigned_to.toUpperCase().localeCompare(listItems[lowest].assigned_to.toUpperCase()) < 0){
							lowest = j;
							flag = true;
						}
					}
					listItems[i] = listItems[lowest];
					listItems[lowest] = temp;
				}
				if(!flag){
					let middle = Math.floor(listItems.length/2);
					let endIndex = listItems.length - 1;
					for(let i = 0; i < middle; i++){
						let temp = listItems[endIndex - i];
						listItems[endIndex - i] = listItems[i];
						listItems[i] = temp;
					}
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			else if(orientation === 7){
				let middle = Math.floor(listItems.length/2);
				let endIndex = listItems.length - 1;
				for(let i = 0; i < middle; i++){
					let temp = listItems[endIndex - i];
					listItems[endIndex - i] = listItems[i];
					listItems[i] = temp;
				}
				await Todolist.updateOne({ _id: listID }, { items: listItems});
			}
			return listItems;
		},
		
		revertSort: async (_, args) => {
			const {_id, prevList} = args;
			const listID = new ObjectId(_id)
			await Todolist.updateOne({ _id: listID }, { items: prevList});
			return prevList;
		},

		updatePosition: async (_, args) => {
			const {_id, newPosition} = args;
			const listID = new ObjectId(_id);
			await Todolist.updateOne({ _id: listID }, { position: newPosition });
			return("Successfully updated position");
		}
	}
}
