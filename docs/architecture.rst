How the backend fits together
=============================

Request flow
------------

.. code-block:: text

   browser --POST /api/merge--> app/api.py
                                  |  (router included)
                                  v
                app/controllers/merge_controller.py   <- HTTP only
                                  |  calls
                                  v
                app/models/pdf_merger.py              <- PDF logic only

Each layer has one job. The *controller* handles uploads, status codes and
errors. The *model* merges PDFs and knows nothing about HTTP, which is why it
is easy to test on its own (see ``tests/test_pdf_merger.py``).

Python OOP terms you will meet in this code
-------------------------------------------

Class
   A blueprint. ``PdfWriter`` (from ``pypdf``) and ``FastAPI`` are classes.

Object / instance
   A thing built from a class. ``writer = PdfWriter()`` creates one. Calling
   a class like a function creates an instance.

Method
   A function that belongs to a class, called on an object:
   ``writer.append(stream)``.

Inheritance
   ``class PdfMergeError(Exception)`` means *PdfMergeError is a kind of
   Exception* and gets everything Exception can do. That is why it can be
   raised and caught.

Exception handling
   ``try`` runs risky code, ``except`` handles a named error, and
   ``raise ... from exc`` swaps in a clearer error while keeping the original
   attached.

Type hints
   ``streams: list[BinaryIO]`` and ``-> bytes`` document what goes in and out.
   Python does not enforce them, but editors, FastAPI and these docs use them.

Decorator
   ``@router.post("/merge")`` above a function registers it as the handler
   for that URL. It is shorthand for passing the function to
   ``router.post("/merge")(...)``.

Naming conventions
   A leading underscore (``_merge``, ``_reduce_size``) marks an internal
   helper that other modules should not rely on.
