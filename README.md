Just a quick tiktoken visualizer i had Claude vibe code up really quick so i dont have to
```
$ nix-shell -p python3Packages.tiktoken
$ python3
>>> import tiktoken
>>> enc = tiktoken.get_encoding("o200k_base")
>>> e=enc.encode("meow the planet")
>>> print(e)
>>> [enc.decode([ee]) for ee in e]
```
to view how something is tokenized 
