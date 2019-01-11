# Todo list web application (Using javascript)

<iframe width="1026" height="564" src="https://www.youtube.com/embed/VGMER_JmS3s" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


자바스크립트를 사용하여 할 일 리스트 웹 어플리케이션을 구현한 프로젝트입니다.<br>
Implement todo list web app with JS.

이 프로젝트는 [Create React App](https://github.com/facebook/create-react-app)기반으로 작성되었습니다.<br>
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

이 프로젝트 디렉토리에서, 아래를 실행할 수 있습니다:<br>
In the project directory, you can run:

### `npm run server`

웹 어플리케이션을 실행하기 전, API 서버를 먼저 실행합니다.<br>
Before running the web application, run the API server.<br>
이 API 서버는 3001번 포트를 사용합니다.<br>
The API server uses port 3001.


### `npm run build`

어플리케이션을 빌드합니다.<br>
Build the application.

빌드된 파일은 `build` 폴더에 저장됩니다.<br>
The built files are stored in the `build` folder.


### `npm start`

어플리케이션을 실행합니다.<br>
Runs the app.<br>
인터넷 브라우저에서 보기 위하여 [http://localhost:3000](http://localhost:3000) 를 여십시오.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

테스트를 실행합니다.<br>
Launches the test.<br>



## Troubleshooting Strategies in todo list web application

해당 프로젝트를 진행하면서 겪은 트러블 슈팅 내용과 해결 방안을 서술합니다.<br>
Describe the trouble shooting and solution that occurred during the project.<br>

먼저 프로젝트 내용에 대해서 설명한 뒤, 순환 참조로 인해 겪은 트러블 슈팅 내용에 대해 설명합니다.<br>
First, i explain the contents of the project, and then describe the troubleshooting i have experienced with circular references.

이 프로젝트에서 할 일은 다른 할 일을 참조할 수 있으며, 참조하는 일은 참조된 일의 하위 작업으로 설계하고 진행했습니다.<br>
In this project todo can refer to other todos, and that is designed and carried on as sub-tasks of the referenced todo.

예시를 들어 설명하겠습니다.<br>
Let me give you an example.


id | todo name | references | created date | modified date | finished
---|-----------|------------|--------------|---------------|----------
1 | Housework | | 2019. 1. 10. 15:59:14 | 2019. 1. 11. 16:59:14 | Not Finished
2 | Washing | 1 | 2019. 1. 11. 15:59:14 | 2019. 1. 11. 16:59:14 | Not Finished
3 | Cleaning | 1 | 2019. 1. 12. 15:59:14 | 2019. 1. 12. 17:59:14 | Not Finished
4 | Room cleaning | 1, 3 | 2019. 1. 12. 15:59:14 | 2019. 1. 12. 09:59:14 | Not Finished

위의 표와 같이 1번 할 일은 2, 3, 4번 할일들에게 참조됩니다.<br>
As shown in the table above, todo 1 is referred to todo 2, todo 3, todo 4.

이 경우에, 할 일 1번은 2, 3, 4번 할 일이 모두 끝나야만 상태를 완료로 변경할 수 있습니다.<br>
In this case, todo 1 can be changed to done only after todo 2, 3, and 4 are completed.

3번 할 일은, 4번에게 참조되고 있기 때문에 4번이 완료되어야 3번도 완료로 바뀔 수 있습니다.<br>
Because the 3 todo is referenced to the 4, the 4 todo must be completed before the 3 todo can be completed.

그렇다면 현재 상황에서 4 -> 2, 3 -> 1 순서로 완료처리할 수 있습니다.<br>
If so, you can complete todos in the current situation in order of 4 -> ( 2, 3 ) -> 1.

하지만, 참조순환으로 인하여 할 일을 끝내지 못하는 상황에 대해서 설명하겠습니다.<br>
However, I will explain the situation when can not finish the todo because of the reference cycle.

아래의 테이블을 보십시오.<br>
See the table below.


id | todo name | references | created date | modified date | finished
---|-----------|------------|--------------|---------------|----------
1 | Housework | | 2019. 1. 10. 15:59:14 | 2019. 1. 11. 16:59:14 | Not Finished
2 | Washing | 1 | 2019. 1. 11. 15:59:14 | 2019. 1. 11. 16:59:14 | Not Finished

이 테이블을 보게 되면, 1번을 끝내기 위해서는 2번이 먼저 끝나야 합니다.<br>
When you see this table, you have to finish 2 todo first to finish todo 1.

여기서 1번의 할 일을 수정하여 1번 할 일이 2번 할 일을 참조하도록 수정합니다.<br>
Here you modify todo 1 so that the todo 1 refers to the todo 2.


id | todo name | references | created date | modified date | finished
---|-----------|------------|--------------|---------------|----------
1 | Housework | 2 | 2019. 1. 10. 15:59:14 | 2019. 1. 11. 16:59:14 | Not Finished
2 | Washing | 1 | 2019. 1. 11. 15:59:14 | 2019. 1. 11. 16:59:14 | Not Finished


이 경우에, 1번 할 일은 2번 할 일이 끝나야 하며, 2번 할 일은 1번 할 일이 끝나야 끝낼 수 있습니다.<br>
In this case, todo 1 must finish todo 2, todo 2 must finish todo 1.


이렇게 순환 참조로 인하여 그 어떠한 할 일도 완료할 수 없는 경우를 처리하는 로직을 작성하였습니다.<br>
I have created a logic to handle cases where can not complete any todo because of this circular reference.

해당 로직은 할 일을 수정할 때에 참조하는 할 일들에 대하여 순차적으로 참조되는 데이터를 가져옵니다.<br>
The logic gets the data that is referenced sequentially for todos to be referenced when modifying the task.

예를 들어, 1번 할 일을 수정할 때에 2번 할 일을 참조한다면 참조값이 참조하는 데이터는 [1] 입니다.<br>
For example, if you refer to the todo 2 when you modify the todo 1, the data referenced by the reference is [1].

참조하는 데이터를 순차적으로 데이터베이스에서 가져왔을 때에, 자기 자신의 ID가 포함되게 되면 순환적인 참조로 판단하고 수정을 거부합니다.<br>
When the reference data is sequentially fetched from the database, it is judged to be a circular reference when the own ID is included, and the modification is refused.

위의 예에서 참조 할일이 참조하는 데이터들을 가져와 경로를 검사하는 경우, 1을 포함하기 때문에 순환 참조로 간주됩니다.<br>
In the example above, the todo, which is to be referenced, is considered to be a circular reference because it contains a 1 when fetch reference data along with.

이 로직은 수정할 때에만 구현되어 있습니다. <br>
This logic is implemented only when you modify it. 

왜냐하면 할 일을 추가할 때에 참조되는 할 일이 없는 경우 추가가 되지 않기 때문에 순환 참조가 바로 생길 수 없기 때문입니다.<br>
This is because a circular reference can not be created immediately because there is no addition if there is no work to be referenced when adding a task.

해당 트러블 슈팅은 현재(2019/1/11) 기준으로 고안한 것으로, 앞으로 좋은 알고리즘 혹은 아이디어가 있다면 업데이트 하겠습니다.<br>
The trouble shooting is based on the current(2019/1/11) standard and I will update if there is a good algorithm or idea in the future.