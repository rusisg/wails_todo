export namespace main {
	
	export class Todo {
	    ID: string;
	    Text: string;
	    Completed: boolean;
	    Created_at: string;
	    Done_at: string;
	
	    static createFrom(source: any = {}) {
	        return new Todo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Text = source["Text"];
	        this.Completed = source["Completed"];
	        this.Created_at = source["Created_at"];
	        this.Done_at = source["Done_at"];
	    }
	}

}

