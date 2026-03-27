# Introducción a BASH

BASH (Bourne Again SHell) es un intérprete de commandos y un lenguaje de scripting. Se puede considerar a la SHELL como un entorno de trabajo que permite al usuario lanzar programas mediante órdenes que suelen formarse con el nombre de un programa y un conjunto de opciones o parámetros.

Por ejemplo, la orden:

```bash
ls -l *.tif
```

````

Producirá un listado (orden `ls`) de todos los ficheros con extensión `tiff` (parámetro `*.tif`). La opción `-l` establece que será un listado largo, incluyendo diversas características de los ficheros.

Una SHELL incluye, además de la posibilidad de ejecutar programas, una series de commandos básicos para el manejo de los archivos y directorios del ordenador, así como herramientas diversas para procesar la información presente en los archivos.

La ventaja de trabajar directamente con la SHELL, en un terminal de texto, es la flexibilidad y la posibilidad de automatizar tareas mediante scripts, pequeños programas que incluyen varias órdenes y herramientas que permiten a aquellas interactuar unas con otras. El precio que hay que pagar es la necesidad de aprender un lenguaje para sacarle partido a la SHELL.

Por ejemplo, ante el problema de convertir 200 ficheros de imagen de formato tiff a formato jpg. ¿Como se haría con un programa basado en iconos y botones? Repitiendo 200 veces una secuencia de movimientos y pulsaciones de ratón. ¿Cómo se haría en linea de commandos? Repitiendo 200 veces una orden similar a `convert fichero.tif fichero.jpg` donde fichero se sustituye cada vez por el nombre de un fichero.

Una posibilidad sería hacer una lista de tareas, es decir escribir en un fichero de texto 200 veces la orden y editar cada linea para poner los nombres correctos de los ficheros.

```
convert fichero_1.tif fichero_1.jpg
convert fichero_2.tif fichero_2.jpg
convert fichero_3.tif fichero_3.jpg
.. .. ..
convert fichero_N.tif fichero_N.jpg
```

A continuación bastaría con copiar y pegar estas lineas en la terminal.

Una posibilidad más inteligente es convertir la lista de tareas en un script. Asumiendo que queremos transformar todos los ficheros tiff del directorio de trabajo, el siguiente script realizará el trabajo por nosotros.

```bash
for i in $(ls *.tif);do
  o=$(echo $i|sed 's/tif/jpg/');
  convert $i $o;
done
```

Además de ahorrarnos tecleo, este script nos ahorrará tener que estar pendientes de que el programa haya terminado una transformación para iniciar la siguiente.

Aunque no entiendas del todo el anterior script quedate con la idea de que la primera linea inicia un bucle y define todos los ficheros de entrada `i` a los que se va a aplicar el contenido del bucle; la segunda linea genera el nombre del fichero de salida (`o`) que corresponde a cada fichero de entrada sustituyendo `tif` por `jpg`; la tercera linea ejecuta la transformación mediante una llamada al programa `convert` y la cuarta cierra el bucle.

## Operaciones con archivos

Un sistema operativo debe proporcionar una series de facilidades para manejar archivos, al menos para los archivos en formato ASCII. A continuación se exponen las operaciones más habituales con ficheros ASCII y los commandos para ejecutarlas en los sistemas operativos tipo Unix:

- Listado de ficheros: `ls`
- Creación, lectura y actualización: mediante un editor como `emacs`, `vi`
- Copiar, mover, renombrar y borrar archivos: `cp`, `mv`, `rm`, `mkdir`
- Visualización: `cat`, `more`, `less`, `head`, `tail`
- Partición del fichero en trozos: `split` (por filas), `cut` (por columnas)
- Concatenación: `cat` (por filas), `join` (por columnas)
- Consulta y sustitución: `sed`, `grep`
- Ordenación: `sort`
- Búsqueda de ayuda: `man`

### Obtener un listado de los archivos

El commando `ls` lista archivos del directorio actual (`ls`) o de cualquier otro (`ls /bin`). Si se añade la opción `-l` have el listado en formato largo, dando detalles. La salida obtenida consta de renglones parecidos a

```
-rw-rw-rw- 1 pp users 138 Apr 5 19:34 leame
```

y se interpretan así:

- El primer carácter indica el tipo de archivo de que se trata, con esta convención:
  - `-` archivo común,
  - `d` directorio,
  - `l` enlace o referencia a otro archivo.

- `rwxrw-rw` son los permisos del archivo. Los tres grupos de 3 characters indican permisos para el dueño del archivo (pepe), su grupo (users) y el resto del mundo.
  - `r` (read) permiso para leer el archivo
  - `w` (write) permiso para modificar o eliminar el archivo
  - `x` (execute) si se trata de un archivo, permiso para ejecutarlo como programa; si se trata de un directorio, permiso para ingresar en él y recorrerlo.

- `1` cantidad de enlaces, referencias a este archivo desde otros archivos ubicados en diferentes lugares.
- `pepe` nombre del usuario dueño del archivo.
- `users` nombre del grupo al que pertenece el archivo
- `138` tamaño en bytes del archivo.
- `Apr 5 19:34` fecha y hora de última modificación. Si no aparece el año, se assume el año corriente.
- `leame` nombre del archivo. Notar que el nombre del archivo está siempre al final.

`ls -a` muestra también archivos ocultos, normalmente no visible en el listado. Los archivos cuyo nombre empieza con un punto son ocultos. Las entradas `.` y `..` representan el directorio actual y el directorio padre, respectivamente.

**Ejemplos adicionales del commando `ls`:**

- `ls -h`: Muestra el tamaño de los archivos en un formato legible para humanos (ej: 1K, 234M, 2G).
- `ls -t`: Ordena los archivos por tiempo de modificación (el más reciente primero).
- `ls -r`: Invierte el orden de la lista.
- `ls -R`: Lista recursivamente todos los archivos y subdirectorios.
- `ls -d`: Muestra información sobre el directorio en sí, no su contenido.
- `ls -F`: Añade un indicador al final de cada entrada (ej: `/` para directorios, `*` para ejecutables).

### Leer el contenido de un archivo

- `cat fichero`: muestra el contenido de `fichero`.
- `more fichero`: presenta el fichero página a página (hay que pulsar una tecla para pasar de página)
- `less fichero`: similar a `more` pero con la posibilidad de ir arriba y abajo dentro del fichero
- `head -n fichero`: presenta las `n` primeras lineas del `fichero` en pantalla
- `tail -n fichero`: presenta las `n` últimas lineas del `fichero` en pantalla

### Gestión de archivos

- `cp fichero1 fichero2`: copia `fichero1` con el nombre `fichero2`.
- `mv fichero1 fichero2`: mueve o renombra `fichero1` a `fichero2`.
- `rm fichero`: borra el archivo.
- `mkdir directorio`: crea un nuevo directorio.

### Partición de archivos

El programa `split` divide un fichero en various ficheros. La opción `-l n` determina cuantas lineas iran a cada fichero, el parámetro `prefijo` determina cual será el prefijo con el que se formarán los nombres de los ficheros de salida (se les añadirán combinaciónes de 2 letras: aa, ab, ac,...). Suponiendo que `fichero1` tiene 4500 lineas, la orden:

```bash
split -l 1000 fichero1 fich
```

generará 5 ficheros: `fichaa`, `fichab`, `fichac`,`fichad`, `fichae`. Los cuatro primeros contendrán 1000 lineas y el último 500.

El programa `cut` selecciona determinadas columnas de un fichero. La opción `-d` permite determinar el carácter que se utilize como separador de columnas, la opción `-f` permite elegir que columnas queremos extraer. La salida de `cut` se dirige a la pantalla pero la podemos redirigir a un fichero.

Si el contenido de `fic1` es:

```
1 alpha 2 azul
2 alpha 3 rojo
3 beta 3 rojo
4 gamma 2 rojo
```

La orden:

```bash
cut -f 2,4 -d " " fic1
```

producirá como salida:

```
alpha azul
alpha rojo
beta rojo
gamma rojo
```

### Concatenación de archivos

El programa `cat` permite también concatenar archivos. La orden `cat fichero1 >> fichero2` copia el contenido de `fichero1` al final de `fichero2`

Para concatenar archivos por columnas se utilize `join`. A partir de dos ficheros `fic1` y `fic2` genera una series de lineas concatenando aquellas que tengan el mismo valor en un determinado campo (columna) que actúa como campo clave. Las opciones más importantes que se pueden pasar a `join` son:

- `-1 n` donde `n` es la columna que actuará como campo clave en el primer fichero (por defecto es la primera).
- `-2 n` donde `n` es la columna que actuará como campo clave en el segundo fichero (por defecto es la primera).
- `-t c` donde `c` es el carácter que se utilize como separador de campos (por defecto es el espacio).

### sed y grep

El commando `grep` permite buscar las líneas que contienen una cadena de characters especificada mediante una expresión regular. Lee la entrada estándar o una lista de archivos y muestra en la salida sólo aquellas líneas que contienen la expresión indicada. La sintaxis es:

```bash
grep patrón archivos
```

donde el patrón a buscar es una expresión regular.

Crea un archivo con los días de la semana, uno por línea; llamarle `dias` y prueba las siguientes órdenes:

```bash
grep martes dias
grep tes dias
```

Entre las opciones de `grep` se cuentan `-i` para evitar distinguir entre mayúsculas de minúsculas, `-n` para mostrar el número de línea en que se produce la coincidencia y `-v` para buscar líneas que no contengan la expresión indicada.

**Ejemplos adicionales del commando `grep`:**

- `grep -r "texto" /ruta/al/directorio`: Busca recursivamente "texto" en todos los archivos dentro del directorio especificado.
- `commando | grep "texto"`: Busca "texto" en la salida de otro commando utilizando una tubería.
- `grep -w "palabra" archivo.txt`: Busca la palabra completa "palabra" en el archivo.
- `grep -c "texto" archivo.txt`: Cuenta el número de líneas que contienen "texto".
- `grep -E "expresión_regular" archivo.txt`: Utilize expresiones regulares extendidas para la búsqueda.

El commando `sed` (stream editor) es un editor de texto no interactivo que realiza transformaciones en un flujo de entrada. Se utilize comúnmente para realizar sustituciones, inserciones, eliminaciones y otras modificaciones en archivos o en la salida de otros commandos.

La sintaxis básica de `sed` es:

```bash
sed 'comando' archivo
```

Algunos ejemplos comunes de `sed` son:

- `sed 's/patron/reemplazo/' archivo`: Sustituye la primera ocurrencia de `patron` con `reemplazo` en cada línea.
- `sed 's/patron/reemplazo/g' archivo`: Sustituye todas las ocurrencias de `patron` con `reemplazo` en cada línea.
- `sed -i 's/patron/reemplazo/g' archivo`: Realiza la sustitución directamente en el archivo (in-place).
- `sed -n 's/patron/reemplazo/p' archivo`: Imprime solo las líneas donde se realizó la sustitución.
- `sed '/patron/d' archivo`: Elimina las líneas que coinciden con `patron`.
- `sed '5d' archivo`: Elimina la línea número 5.
- `sed '$d' archivo`: Elimina la última línea.
- `sed 's/^/prefijo/g' archivo`: Añade "prefijo" al principio de cada línea.
- `sed 's/$/sufijo/g' archivo`: Añade "sufijo" al final de cada línea.

**Ejemplos avanzados de `sed`:**

- `sed -r 's/(.*)patron(.*)/\2patron\1/' archivo`: Intercambia las partes antes y después de "patron" en cada línea.
- `sed 'y/abc/xyz/' archivo`: Transforma "a" en "x", "b" en "y", "c" en "z".
- `sed '1,5s/patron/reemplazo/' archivo`: Aplica la sustitución solo a las líneas 1 a 5.

### sort

El commando `sort` permite la ordenación del contenido de un fichero por characters ASCII o por valor numérico. La ordenación ASCII es la más parecida a la alfabética; sigue el orden del juego de characters ASCII. En la ordenación numérica se respeta la ordenación por valor numérico de la cadena de characters: 101 va después de 21; en ordenamiento ASCII sería al revés.

- `sort arch1`: ordena según el código ASCII.
- `sort -n arch2.num`: ordena numéricamente.

Si no se indican campos de ordenación, la comparación se have sobre toda la línea. Si se indican campos, la comparación se have considerando la cadena de characters iniciada en el primer character del primer campo hasta el último character del último campo.

```bash
sort -t: -k1,3 arch1.txt
```

ordena por campos separados por ":", tomando en cuenta para la comparación los characters desde el primero del campo 1 hasta el último del campo 3.

```bash
sort -t: -k1.3,3.5 arch1.txt
```

ordena por campos tomando en cuenta desde el 3er. character del campo 1 hasta el 5to. character del campo 3.

- `sort -nr arch2.num`: ordena en orden numérico descendente.
- `sort -k3 arch3.txt`: ordena alfabéticamente, usando como cadena de comparación la comprendida desde el primer character del 3er. campo hasta el fin de lína. Como no se indica separador, los campos se deﬁnen por blancos (espacio o tabulador).

Otras opciones interesantes son `-f` que ordena sin distinguir entre mayúsculas y minúsculas; y `-r` que ordena en orden inverso.

### Búsqueda de ayuda

BASH dispone de un programa para generar ayuda relativa a cualquier programa o commando del sistema (`man`). Por ejemplo:

```bash
man sort
```

mostrará en pantalla la ayuda de dicho programa.

## Variables

Un script puede set una simple lista de ordenes de sistema. Sin embargo para que sean realmente útiles los scripts necesitan tener cierta capacidad de generalización. Para ello es necesario el uso de variables:

```bash
x=10
echo $x
```

Como ves, cuando se deﬁne una variable no hay que precederla de un `$` pero si cuando se utilize.

El commando `echo Mensaje_en_pantalla` muestra en la pantalla el mensaje indicado.

- `echo Mensaje_en_pantalla > fichero`: Escribe el mensaje en el archivo `fichero`.
- `echo Otro_mensaje_en_pantalla >> fichero`: Concatena el mensaje en el archivo `fichero`.

Otra posibilidad a la hora de deﬁnir una variable es asignar a esta el resultado de la ejecución de una orden, para ello basta con poner la orden entre paréntesis precedida de un `$`. Puede verlo en el siguiente ejemplo:

```bash
x=$(seq 1 10)
echo $x
```

La orden `seq` simplemente devuelve la secuencia de números solicitada, en este caso se ha almacenado en la variable `x` cuyo valor pasa a set:

```
1 2 3 4 5 6 7 8 9 10
```

### Expresiones aritméticas

En BASH podemos introducir expresiones aritméticas sencillas que sólo admiten números enteros:

```bash
a=3;b=5;c=4;d=7
y=$(( ($a *$b + $c *$d)/6 ))
echo $y
```

El resultado será 7 debido al redondeo.

La orden `let` permite ejecutar cálculos sencillos evitando los pairs de paréntesis iniciales y finales:

```bash
a=3
let b=$a+3
let c=$a *3
echo $a $b $c
```

El resultado será: `3 6 9`.

Admite también divisiones:

```bash
a=30
let a=$a/3
echo $a
```

pero sólo enteras. En caso de necesitar calculos más complejos es preferible utilizar `awk`:

```bash
a=4;b=7
c=$(echo $a $b|awk '{print sqrt($1 *$1+$2*$2)}')
echo $a $b $c
```

En este último ejemplo, además de utilizar `awk` para hacer una raiz cuadrada, se ha utilizado la sintáxis `c=$(orden)` para asignar como valor de una variable el resultado de una orden al sistema.

### Expresiones lógicas

El número de expresiones lógicas que pueden veriﬁcarse es muy grande, incluyendo operadores para cadenas de carácteres y números enteros, pero no para reales.

#### Operadores de comparación numéricos

- Igual: `-eq`
- No igual: `-ne`
- Menor que: `-lt`
- Menor o igual que: `-le`
- Mayor que: `-gt`
- Mayor o igual que: `-ge`

El commando `test` nos sirve para realizar comparaciones, el valor que devuelve es 0 si la comparación es cierta y 1 si no lo es. Por ejemplo el script:

```bash
num=5
test $num -eq 10
$?
```

devolverá 1. En este script se ha utilizado la expresión `$?` que devuelve el valor devuelto por la última orden ejecutada.

#### Operadores de comparación de texto

Aunque resulte algo antiintuitivo, BASH utilize los comparadores habituales en matemáticas para comparar textos (mientras que para números utilize los que se han visto anteriormente). Así la lista de comparadores es:

- Igual: `=`
- No igual: `!=`
- Menor que: `<`
- Mayor que: `>`

Para utilizar el commando `test` con textos es necesario entrecomillar las variables:

```bash
a=Elefante;b=Cocodrilo
test "$a" = "$b"
echo $?
test "$a" != "$b"
echo $?
```

Los resultados serán 1 en el primer caso y 0 en el segundo.

Podemos encadenar condiciones con los operadores Y lógico (`&&`), O lógico (`||`) y NO (`!`). Por ejemplo:

```bash
test "$a" != "$b" && test 2 -eq 2
```

Recuerda que en operaciones lógicas `||` tiene la misma precedencia que la suma y `&&` la misma que el producto, así que cuando sea necesario habrá que poner paréntesis, es decir que las siguientes expresiones no son iguales y no producirán el mismo resultado:

```bash
test "$a" == "$b" && test 2 -eq 3 || test 2 -eq 2
test "$a" == "$b" && ( test 2 -eq 3 || test 2 -eq 2 )
```

#### Operadores lógicos con ficheros

Existen diversos operadores para consultar características sobre los ficheros presentes en el sistema. Por ejemplo:

```bash
test -e mifichero.txt
echo $?
```

devolverá 0 si el fichero existe. Puedes consultar la lista de pruebas que puedes ejecutar sobre los archivos en la página de manual de `test` (`man test`).

### Arrays

También podemos deﬁnir arrays en BASH:

```bash
declare -a identificador
identificador=(1 22 33 40 51)
echo ${identificador}
```

Hay que tener en cuenta que:

- Son necesarias las llaves
- El primer elemento del array es el 0
- Si se sustituye el índice entre corchetes por un asterisco, devuelve todos los valores

Así el resultado del anterior script será 40 ya que es el tercer elemento del array.

Si tras el script anterior escribimos:

```bash
identificador=50
echo ${identificador[ *]}
```

El resultado será:

```
1 22 33 50 51
```

como ves podemos modiﬁcar directamente los elementos de un array.

### Concatenación de variables

Para concatenar dos variables de texto en BASH basta con escribirlas juntas tal como se puede ver en los siguientes ejemplos:

```bash
extension=txt;fichero=datos
echo $fichero.$extension
extension=txt;fichero=datos
fichero=${fichero}001.$extension
```

Si no resulta evidente donde termina el nombre de la variable es necesario delimitarlo explicitamente con llaves tal como se ve en el segundo ejemplo.

El entrecomillado simple convierte toda la concatenación en un literal.

```bash
extension=txt;fichero=datos
fichero='${fichero}001.$extension'
echo $fichero
```

la salida de este último script será

```
${fichero}001.$extension
```

## Interacción con el usuario

### Hacer ejecutable un script

Hasta ahora, los ejemplos que se han visto podían copiarse y pegarse directamente. En muchos casos es una buena idea abrir un editor de textos y escribir las órdenes en él para luego copiarlas y pegarlas en el terminal de texto ya que es mucho más fácil editar sobre un editor que sobre el terminal.

Sin embargo para que los scripts sean realmente útiles es necesario convertirlos en programas que puedan set ejecutados por el usuario. Para ello debes decirle al sistema que tu fichero de texto que contiene las órdenes puede set ejecutado. Para ello debes modiﬁcar el modo del fichero:

```bash
chmod 755 miscript
```

De este modo le concedes permiso de lectura, escritura y ejecución al dueño del fichero (o sea a ti mismo) y permiso de lectura y ejecución al resto de los usuarios. Es recomendable utilizar `chmod 700 miscript` para restringir la ejecución solo al propietario.

Por otra parte el sistema debe saber, al ejecutar tu programa, a que intérprete de órdenes se dirigen estas; puesto que estamos programando para BASH escribiremos como primera linea del programa:

```bash
#!/bin/bash
```

Esta línea, conocida como "shebang", indica al sistema que el script debe set ejecutado con el intérprete BASH.

Este sistema puede utilizarse con programas desarrollados para cualquier lenguaje interpretado:

```bash
#!/usr/bin/perl
#!/usr/bin/awk
#!/usr/bin/tclsh
```

Siempre que, por supuesto, el intérprete este disponible en el sistema y las órdenes presentes en el ﬁchero correspondan a ese lenguaje.

### Parámetros que se pasan al programa

A un script, como a cualquier tipo de programa se le puede pasar cualquier número de parámetros. BASH utilize parámetros posicionales y dentro del script se have referencia a ellos mediante las variables `$1` para el primer parámetro, `$2` para el segundo, etc.

Suponiendo que el script `parametros` contiene:

```bash
#!/bin/sh
echo $3 $2 $1
```

La siguiente llamada:

```bash
~$ parametros uno dos tres
```

producirá la siguiente salida:

```
tres dos uno
```

### Escribiendo texto en pantalla

Ya has visto como `echo` es el commando adecuado para producir salidas de texto en pantalla. Se trata de un commando bastante primitivo, una opción más interesante sería utilizar `printf`. Este programa utilize como primer parámetro una cadena de texto que especiﬁca el formato con el que se van a escribir las variables, y a continuación estas variables.

```bash
quien=mundo
printf "Hola %s\n" $quien
```

- `%d` Número entero
- `%nd` Número entero formateado a `n` characters
- `%f` Número real
- `%m.nf` Número real con `n` decimales formateado a `m` characters
- `%s` Cadena de carácteres

El commando `printf` es equivalente a funciones que, con el mismo nombre, están disponibles en C o AWK; permite formatear la salida de texto según un patrón entrecomillado. Este patrón puede estar formado por characters, caractéres de control precedidos por `\` (`\t` es el tabulador y `\n` el retorno de carro) o códigos que reservan posiciones para las variables que se van a escribir (ver la siguiente tabla).

### Pidiendo información al usuario

El commando `read` espera a que el usuario introduzca un dato mediante el teclado (hay que pulsar retorno de carro para que `read` entienda que el usuario ha terminado). Puede servir simplemente para dar al usuario control sobre el tiempo de ejecución del script, pero resulta más útil para permitir que el usuario de valor sobre la marcha a las variables:

```bash
read algo
echo $algo
```

Puede utilizarse de forma más soﬁsticada añadiendo un prompt para que el usuario sepa que hacer:

```bash
read -p "Dime algo: " -a algo
echo Has dicho $algo
```

Más interesante puede set utilizar arrays en combinación con el commando `select` para generar menús para el usuario:

```bash
declare -a acciones
acciones=(copiar renombrar borrar)
select accion in ${acciones[ *]};do
  echo Has elegido $accion
done
```

## Tuberias y redirecciones

A veces es útil enviar la salida de un programa directamente a la pantalla (el comportamiento por defecto), pero en otros casos será más interesante redirigir esta salida a otro lugar. Cualquier programa informático puede concebirse como un sistema que transforma un archivo de entrada en otro de salida. En Unix este hecho es especialmente evidente ya que el sistema proporciona una gran ﬂexibilidad para construir sistemas de proceso de datos mediante la integración de commandos. Las tuberías `|` y las redirecciones `>` o `>>` que son los elementos clave para conseguir esta integración.

```bash
ls -l > listado.txt
```

Crea un fichero de texto llamado `listado.txt` que contendrá el listado de ficheros producido con `ls`. El inconveniente es que si `listado.txt` existía previamente lo eliminará. Para evitarlo se puede utilizar:

```bash
ls -l >>listado.txt
```

que, en caso de que `listado.txt` existiera previamente, lo mantendrá y escribirá la salida de `ls -l` a continuación del contenido preexistente.

El programa `cat` proporciona como salida el contenido del archivo de entrada pero este se puede redirigir a otro archivo:

```bash
cat archivo1 > archivo2
```

De esta forma, `archivo2` será una copia de `archivo1`. Si `archivo2` existía previamente habrá sido eliminado. Si en lugar de eleminarlo hubiesemos querido añadir a `archivo2` el contenido de `archivo1`, la orden hubiese sido:

```bash
cat archivo1 >> archivo2
```

Un tercer tipo de redirección es `<` que permite que una orden tome sus datos de entrada de un fichero.

Las tuberías `|` permiten pasar a un programa la salida de otro; por ejemplo:

```bash
ls -l|more
```

Pemitirá ver página por página el listado producido por `-l`.

```bash
ls|awk 'print $8'|grep 4
```

redirige el listado que se obtiene como salida de `ls` a `grep` con el parámetro `4` que seleccionará sólo aquellos ficheros que incluyan el número 4 en su nombre.

La ﬁlosofía de Unix se basa en muchas herramientas pequeñas (como `cat`, `more`, `grep` o `ls`) que hacen una tarea sencilla y su potencia reside en la capacidad de integrar (mediante tuberías redirecciones y otros elementos de programación) varias de estas herramientas para hacer una tarea compleja.

## Control del flujo

BASH, además de un entorno de trabajo, es un lenguaje de programación, y como cualquiera de ellos necesita decidir que acciones ejecutar según los resultados de operaciones anteriores. Además es necesario automatizar la repetición de determinadas acciones un número ﬁjo de veces o en función de que se cumpla o no una condición.

### Condicionales

Ya se ha visto como existen diversos operadores que permiten determinar si se cumple una determinada condición y devuelven un valor cierto (0) o false (1). Ahora se verá como se puede hacer que los valores de estas comparaciones determinen cual será el rumbo que cogerá un programa.

#### if

Permite seleccionar entre unas pocas opciones:

```bash
if [ "$x" = "$k" ]; then
  echo Son iguales
else
  echo No son iguales
fi
```

La identación de lineas que has visto en este ejemplo no es obligatoria pero ayuda a que el programa sea más legible, en los ejemplos que siguen aparece a menudo.

```bash
if [ $edad -le 18 ]; then
  echo Joven
else
  echo Mayor
fi
```

#### Estructuras case

Una alternativa a `if` cuando las opciones posibles son varias es la herramienta `case`:

```bash
case $opcion in
  -f)
    echo Opcion -f;;
  -k)
    echo Opción -k;;
  fichero)
    echo fichero;;
  *)
    echo Opción inválida;;
esac
```

```bash
case $edad in
  8|9|10|11|12|13) echo niño ;;
  14|15|16|17|18) echo joven ;;
  *) echo mayor;;
esac
```

### Bucles

#### Bucles con for

El commando `for` ejecuta el bucle de instrucciones situado entre `do` y `done` para el conjunto de valores de la variable especiﬁcada en la orden (el conjunto de valores también se especiﬁca en la orden).

En el siguiente ejemplo se muestra la tabla del 2, se ha utilizado el commando `printf` para conseguir un adecuado formateado de la salida:

```bash
for v in $(seq 1 10);do
  let v2=$v *2;
  printf "%d *%d=%d\n" $v 2 $v2
done
```

El siguiente script muestra un bucle integrado dentro de otro para mostrar las tablas de multiplicar.

```bash
for v in $(seq 1 10);do
  for v2 in $(seq 1 10); do
    let v3=$v *$v2;
    printf "%d *%d=%d\t" $v $v2 $v3
  done
  printf "\n"
done
```

**Ejemplos adicionales del bucle `for`:**

- Iterar sobre una lista de archivos:

  ```bash
  for file in *.txt; do
    echo "Procesando archivo: $file"
  done
  ```

- Iterar sobre un rango de números:

  ```bash
  for i in {1..5}; do
    echo "Número: $i"
  done
  ```

- Iterar sobre los arguments pasados al script:

  ```bash
  for arg in "$@"; do
    echo "Argumento: $arg"
  done
  ```

- Renombrar archivos con espacios:
  ```bash
  for file in *\ *; do
    mv "$file" "${file// /_}"
  done
  ```

#### Bucles con while

El commando `while` ejecuta el bucle de instrucciones situado entre `do` y `done` mientras se cumpla la condición especiﬁcada como parámetro en la llamada. Por ejemplo el siguiente script escribe los números del 1 al 10:

```bash
a=1
while test $a -le 10;do
  echo $a
  let a=$a+1
done
```

En el siguiente ejemplo se verán diversas opciones nuevas:

```bash
while who|grep pepe>/dev/null;do
  sleep 30
done
echo ... y ahora lanzo el proceso gordo
```

Este script comprueba cada 30 segundos si el usuario `pepe` está conectado al ordenador y sólo cuando se haya desconectado ﬁnaliza el bucle y pasa a ejecutar el resto del script que, en este caso, podría set el típico proceso que consume muchos recursos y es preferible ejecutar cuando no haya otros usuarios trabajando.

La orden `who` presenta un listado de los usuarios conectados al sistema; este listado se pasa mediante una tubería a la orden `grep pepe` que dará una respuesta positiva si pepe está incluido en el listado. En ese caso esperará 30 segundos (`sleep 30`) y volverá a consultar.

La salida de `grep pepe` se dirige a `/dev/null` que es un dispositivo virtual que se utilize para evitar que la información llegue constantemente a la terminal de salida.

**Ejemplos adicionales del bucle `while`:**

- Leer un archivo línea por línea:

  ```bash
  while read line; do
    echo "Línea: $line"
  done < archivo.txt
  ```

- Bucle infinito:

  ```bash
  while true; do
    echo "Ejecutando..."
    sleep 1
  done
  ```

- Bucle hasta que un commando tenga éxito:

  ```bash
  until ping -c 1 google.com; do
    echo "Esperando conexión..."
    sleep 5
  done
  echo "Conexión establecida."
  ```

#### Bucles con until

El commando `until` permite realizar el proceso contrario, es decir ejecutar el bucle hasta que se cumpla la condición especiﬁcada. El siguiente script es equivalente al anterior pero ahora esperamos al usuario `pepe` para lanzar un proceso.

```bash
usuario=pepe
until who|grep \$usuario>/dev/
```
````
