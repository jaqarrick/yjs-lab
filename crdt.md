# What is a CRDT or _Conflict Free Replicated Data Types_?

[CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) are data structures that can be replicated across multiple computers in a network. These replicas can be updated independently or concurrently without coordination between the replicas and resolve themselves automatically. 

Inconsistencies i.e. conflicts are resolved through a *conflict resolution algorithms*. 

## Why CRDTs are _useful_
Multi-user editing and collaboration over networks presents a vast array of issues. To illustrate where things can go wrong, even in a simple 2-user environment, let's consider the following examples. 

In the simplest case, two users have replicate sets of letters. If each user performs a transaction on their set, those transactions could then be sent to the other user. The transactions can be unionized, and then each user performs the actions from the other user:

![set_of_letters](/images/list.png)

Each user ends up with the correct, expected list of letters. This is all well and good, but in the _real world_ things aren't this simple. Consider another _slightly more complex_ example. 

Say we have two replicates of a string. In order to keep track of the letters, we assign each of the letters an _index_. When we remove or insert a letter, we supply the letter and the place to insert or remove it. However, this can cause some issues. In the figure below, one user deletes a letter at position 2, while the other user deletes a letter at position 1 _and_ inserts a letter at 7. When these the users exchange actions, incorrect letters are removed and the string becomes _jumbled_.


![string1](/images/string1.png)


A possible solution to this issue is to _transform_ the operation that a user performs _after_ an edit by a second user. For example if user A deletes the 6th index from the string, user B's operation of adding 's' to the 7th index would be transformed to `insert s at position (7-1)`


![string2](/images/string2.png)

This is a _extremely_ boiled down example of method called [operational transformation](https://en.wikipedia.org/wiki/Operational_transformation), which is a solution for conflict resolution. However, this is a very _limited_ approach. Many iterations have tried and failed at solving issues where more than 2 users are editing a document, or manipulating data, at once. In fact, Google Docs uses OT, however this only works because a central _Google Server_ acts as the arbiter between multiple peers. With OT, a true multi-user editing system is very difficult. 

Here enters CRDTs, which attempt to solve concurrency issues through resolution algorithms, allowing for a seamless multi-user editing system. 

## Strong Eventual Consistently
Generally consistency in distributed systems can be _strong_ or _eventual_. Strong consistency allows for sequential writes, but is impossible when users are disconnected from each other and aren't available with [network partitions](https://en.wikipedia.org/wiki/Network_partition). Eventual consistency allows for individual partitions to converge _eventually_, but these can be complicated algorithms that are hard to test.

CRDTs _raise the bar_ in striving for _strong eventual consistency_. Once two nodes have seen the same event, they are immediately in the same state. 



## Types of CRDTs
There are two main approaches when designing a CRDT. 
1. **Operation-based CRDTs** - transmit only the operation. The replicas receive the operations and apply them locally. 
2. **State-based CRDTs** - Send the whole local state to other replicates. These are easier to implement, but are more costly. 

## Operation-based CRDT
OP-based CRDTs need to follow a set of rules to assure strong eventual consistency. 
1. All concurrent operations must commute
    - ie. `(x*2)-1 !== (x-1)*2` but `(x-4)-3 === (x-3)-4`
2. Assume that updates are applied **exactly once**
3. Updates must be applied _in the order from which they were sent from their origin_.

In the example below, two users are sharing simple counter data. What is shared between the users is the actual _operation_ that each user attempts to perform. The **action** is performed locally, increasing or decreasing the value, and then shared with the second user. 

In the second figure, the value is a `map` and not a number. Concurrency is dealt with in this case by assigning each entry a unique id (in this case `Xa` or `Xb`) that that additions and removals can be tracked accurately. 

![operation](/images/operation.png)


## State-based CRDTs
These update the local state, then send the state and merge with other users. 
1. Allow for retransmissions. The merge function should be [idempotent](https://en.wikipedia.org/wiki/Idempotence). 
2. We need a concept of 'going forward', i.e. clocks. 
3. Updates and merges always go forward and must increase the state in this order. 

In the example of a state-based CRDT algorithm below, the entire state, in this case an object containing all actions performed on the `a` property. Whenever a local transaction occurs, the whole state is passed `{a: +3, -5}`, for example. 

![state](/images/state.png)



