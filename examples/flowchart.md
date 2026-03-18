# Flowchart Example

The `flowchart` directive is not supported by WikiJS's bundled Mermaid 8.8.2.
With this patch, it works:

```mermaid
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E
```

## Bidirectional Arrows

Not available in Mermaid 8.8.2:

```mermaid
flowchart LR
    Client <--> Server
    Server <--> Database
```

## Ampersand Chaining

Multiple connections in a single statement — not supported in v8:

```mermaid
flowchart TD
    A --> B & C & D --> E
```
