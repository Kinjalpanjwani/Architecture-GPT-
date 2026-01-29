
import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
bpy.ops.object.light_add(type='SUN', location=(0, 0, 10))
bpy.ops.object.camera_add(location=(5, -5, 5), rotation=(1.1, 0, 0.9))
bpy.context.scene.camera = bpy.context.object
bpy.context.scene.render.filepath = "/tmp/blender_render.png"
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.ops.render.render(write_still=True)
