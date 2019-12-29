const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

function isValidDependencyGraph(dependency){

    for (const {i,d} of dependency.map((d, i ) => ({d,i}))) {
        let ds = d.dependency
        if(ds.indexOf(i) !== -1)
            return false        
        return !isCircular(ds, i, dependency)
    }

}

function isCircular(dependency, index, fullDependency){
    
    for (const {d} of dependency.map((d, i ) => ({d,i}))) {
        let ds = fullDependency[d].dependency        
        if(ds.indexOf(index) !== -1)
            return true
        if(ds.length == 0)
            return false
        return isCircular(ds, index, fullDependency)
    }
}

app.post('/mission', (req, res) => {

    let dependency = req.body.dependencyGraph.tasks
    if(!isValidDependencyGraph(dependency)){
        throw new Error("Invalid Dependency Graph!")
    }
    let status = req.body.currentState.tasks 
    let task = req.body.task

    let subTask = dependency[task].dependency
    if(subTask.length == 0)
        return res.json({ open: true })
    let open = true
    subTask.forEach(subTask => {
        if(status[subTask].status == 'pending')
            open = false 
    });
    return res.json({ open })
})

app.listen(3000, () =>
	console.log('server is running in port 3000...')
)