
import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_cube_add(size=2, location=(0, 0, 1))
bpy.ops.object.light_add(type='SUN', location=(0, 0, 10))
bpy.ops.object.camera_add(location=(10, -10, 5), rotation=(1.2, 0, 0.9))
camera = bpy.context.object
camera.keyframe_insert(data_path="location", frame=1)
camera.location = (0, -5, 5)
camera.keyframe_insert(data_path="location", frame=50)
bpy.context.scene.camera = camera
bpy.context.scene.render.filepath = "/tmp/architecture_animation.mp4"
bpy.context.scene.render.image_settings.file_format = 'FFMPEG'
bpy.context.scene.render.ffmpeg.format = 'MPEG4'
bpy.context.scene.render.fps = 24
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 50
bpy.ops.render.render(animation=True)
