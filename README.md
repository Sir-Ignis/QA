# QA with Background Workers in Node.js with Redis

Uses two bull queues to do the background work,
with one queue used to add the question and file name
as data and the other queue used to add the answer
as the queue data. This way we can always display some
kind of reference to the answer even if it hasn't been
calculated. The view is updated periodically so as to
ensure that if the user spam clicks the add job button
then we can display the correct view.
