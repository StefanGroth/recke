Expression = 
	HelpCommand /
    AddCommand /
    ChangeCommand /
    RecCommand /
    RemoveCommand /
    ListCommand /
    RoleCommand
    
HelpCommand = _ "help" { return {command : 'help'}}

AddCommand = _ "add"_ tags:Tags _ recommendation:Recommendation { 
	 
	return { 
    	command: "add",
    	tags,
      	recommendation
    }
}

RecCommand = _ "reck" _ tags:Tags { return { command: "recommend", tags  } } 

ChangeCommand = _ "change" _ id:Number _ tags:Tags _ recommendation:Recommendation {
	return {
    	command: "change",
        id,
        tags: tags.map(t => t.toLowerCase()),
      	recommendation
    }
}

RemoveCommand = _ "remove" _ id:Number { 
  return { 
    command: "remove",
    id
  }
}

ListCommand = _ "list" { return { command: "list" }}

RoleCommand = 
  _ "role" _ modifier:( "add" / "remove" ) _ name:Word { 
	  return { 
    	command: "role",
        modifier,
        name
    }
} / _ "role" _ "list" _ { return { command: "role", modifier: "list" }} 

Tags = "[" _ head:Tag _ tail:("," _ Tag _)* _ "]" {
	return [head].concat(tail.map(tag => tag[2]))
}

Tag = head:Word tail:(_ Word)* {
	return [head].concat(tail.map(word => '-' + word[1])).join('').toLowerCase()
}

Recommendation = rec:.* { return rec.join("") }
Word = char:Char+ { return char.join("") }
Char = [a-zA-Z0-9-_]
Number = [0-9]+ { return parseInt(text(), 10) }

_ "whitespace"
  = [ \t\n\r]*
  