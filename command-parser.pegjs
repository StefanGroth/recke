Expression = 
	HelpCommand /
    AddCommand / 
    ChangeCommand /
    RecCommand / 
    RemoveCommand /
    ListCommand /
    RoleCommand /
    .* { return { command : "not-found" } }

HelpCommand = _ "help".* { return {command : 'help'}}

AddCommand = _ "add"_ tags:Tags _ recommendation:Recommendation { 
	 
	return { 
    	command: "add",
    	tags: tags.map(t => t.toLowerCase()),
      	recommendation
    }
}

RecCommand = _ "reck" _ tags:Tags _ .* { return { command: "recommend", tags  } } 

ChangeCommand = _ "change" _ id:Number _ tags:Tags _ recommendation:Recommendation {
	return {
    	command: "change",
        id,
        tags: tags.map(t => t.toLowerCase()),
      	recommendation
    }
}

RemoveCommand = _ "remove" _ id:Number _ { 
  return { 
    command: "remove",
    id
  }
}

ListCommand = _ "list" _ { return { command: "list" }}

RoleCommand = 
  _ "role" _ modifier:( "add" / "remove" ) _ name:Word { 
	  return { 
    	command: "role",
        modifier,
        name
    }
} / _ "role" _ "list" { return { command: "role", modifier: "list" }} 

Tags = "[" _ head:Word _ tail:("," _ Word _)* _ "]" {
	return [head].concat(tail.map(tag => tag[2]))
}

Recommendation = rec:.* { return rec.join("") }
Word = char:Char+ { return char.join("") }
Char = [a-zA-Z0-9-_]
Number = [0-9]+

_ "whitespace"
  = [ \t\n\r]*