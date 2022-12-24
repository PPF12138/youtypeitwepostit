"""
import click

@click.command()
@click.option('--count', default=1, help='Number of greetings.')
@click.option('--name', prompt='Your name',
              help='The person to greet.')
def hello(count, name):
     """
"""Simple program that greets NAME for a total of COUNT times. """
"""
    for x in range(count):
        click.echo(f"Hello {name}!")
@click.command()
@click.argument('x')
@click.argument('y')
@click.argument('z')
def show(x, y, z):
    click.echo('x: %s, y: %s, z:%s' % (x, y, z))
if __name__ == '__main__':
    show()

if __name__ == '__main__':
    hello()
 """
